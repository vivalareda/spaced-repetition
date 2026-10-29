/// <reference types="vite/client" />
// biome-ignore-all lint/style/noMagicNumbers: expected intervals read more clearly as literals
import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;
const API_KEY = "key-1";
const OTHER_API_KEY = "key-2";

async function setup() {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", { clerkId: "user-1" });
    await ctx.db.insert("apiKeys", { userId, apiKey: API_KEY });
    const otherId = await ctx.db.insert("users", { clerkId: "user-2" });
    await ctx.db.insert("apiKeys", { userId: otherId, apiKey: OTHER_API_KEY });
  });
  return t;
}

type TestConvex = Awaited<ReturnType<typeof setup>>;

function createTextCard(t: TestConvex, question: string, deck?: string) {
  return t.mutation(api.cards.createCard, {
    apiKey: API_KEY,
    question,
    answer: `${question} answer`,
    deck,
  });
}

/** Makes `cardId` due `daysFromNow` days from NOW (negative: overdue). */
function setDue(t: TestConvex, cardId: Id<"cards">, daysFromNow: number) {
  return t.run((ctx) =>
    ctx.db.patch(cardId, { nextReviewDate: NOW + daysFromNow * DAY })
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  return () => {
    vi.useRealTimers();
  };
});

describe("API-key access", () => {
  it("rejects unknown API keys", async () => {
    const t = await setup();
    await expect(t.query(api.cards.get, { apiKey: "nope" })).rejects.toThrow(
      "API key not found"
    );
  });

  it("only exposes the key owner's cards", async () => {
    const t = await setup();
    const cardId = await createTextCard(t, "mine");

    expect(await t.query(api.cards.get, { apiKey: OTHER_API_KEY })).toEqual([]);
    await expect(
      t.mutation(api.cards.deleteCard, { apiKey: OTHER_API_KEY, cardId })
    ).rejects.toThrow("Not authorized");
  });

  it("still uses the logged-in user without an API key", async () => {
    const t = await setup();
    await createTextCard(t, "mine");
    const asUser = t.withIdentity({ subject: "user-1" });
    expect(await asUser.query(api.cards.get, {})).toHaveLength(1);
  });
});

describe("cards", () => {
  it("updates content fields and keeps the card valid", async () => {
    const t = await setup();
    const cardId = await t.mutation(api.cards.createCard, {
      apiKey: API_KEY,
      cardType: "mcq",
      question: "2 + 2?",
      answer: "",
      options: ["3", "4"],
      correctOptionIndex: 1,
    });

    await t.mutation(api.cards.updateCard, {
      apiKey: API_KEY,
      cardId,
      question: "1 + 1?",
      options: ["2", "3", "4"],
      correctOptionIndex: 0,
    });
    const card = await t.query(api.cards.getCard, { apiKey: API_KEY, cardId });
    expect(card).toMatchObject({
      question: "1 + 1?",
      options: ["2", "3", "4"],
      correctOptionIndex: 0,
    });

    await expect(
      t.mutation(api.cards.updateCard, {
        apiKey: API_KEY,
        cardId,
        options: ["2"],
      })
    ).rejects.toThrow("MCQ cards require at least 2 options");
  });

  it("moves a card to a deck and out of it", async () => {
    const t = await setup();
    const deckId = await t.mutation(api.decks.createDeck, {
      apiKey: API_KEY,
      deckName: "Math",
    });
    const cardId = await createTextCard(t, "q");

    await t.mutation(api.cards.moveCardToDeck, {
      apiKey: API_KEY,
      cardId,
      deckId,
    });
    expect(
      (await t.query(api.cards.getCard, { apiKey: API_KEY, cardId })).deckId
    ).toBe(deckId);

    await t.mutation(api.cards.moveCardToDeck, { apiKey: API_KEY, cardId });
    expect(
      (await t.query(api.cards.getCard, { apiKey: API_KEY, cardId })).deckId
    ).toBeUndefined();
  });
});

describe("decks", () => {
  it("renames a deck, rejecting names already used by another deck", async () => {
    const t = await setup();
    const deckId = await t.mutation(api.decks.createDeck, {
      apiKey: API_KEY,
      deckName: "Math",
    });
    await t.mutation(api.decks.createDeck, {
      apiKey: API_KEY,
      deckName: "French",
    });

    await expect(
      t.mutation(api.decks.updateDeck, {
        apiKey: API_KEY,
        deckId,
        deckName: "french",
      })
    ).rejects.toThrow("Deck already exists");

    await t.mutation(api.decks.updateDeck, {
      apiKey: API_KEY,
      deckId,
      deckName: " math ",
      deckDescription: "Numbers",
    });
    const decks = await t.query(api.decks.getUserDecks, { apiKey: API_KEY });
    expect(decks.find((deck) => deck._id === deckId)).toMatchObject({
      deckName: "math",
      deckDescription: "Numbers",
    });
  });

  it("deletes a deck together with its cards", async () => {
    const t = await setup();
    const deckId = await t.mutation(api.decks.createDeck, {
      apiKey: API_KEY,
      deckName: "Math",
    });
    await createTextCard(t, "in deck", "Math");
    await createTextCard(t, "loose");

    await t.mutation(api.decks.deleteDeck, { apiKey: API_KEY, deckId });
    const cards = await t.query(api.cards.get, { apiKey: API_KEY });
    expect(cards.map((card) => card.question)).toEqual(["loose"]);
  });
});

describe("review sessions", () => {
  it("reports no session before one starts", async () => {
    const t = await setup();
    expect(await t.query(api.reviews.current, { apiKey: API_KEY })).toEqual({
      status: "none",
    });
  });

  it("reviews due cards, most overdue first, and requeues again once", async () => {
    const t = await setup();
    const recent = await createTextCard(t, "recent");
    const old = await createTextCard(t, "old");
    const later = await createTextCard(t, "later");
    await setDue(t, recent, -1);
    await setDue(t, old, -3);
    await setDue(t, later, 2);

    expect(await t.mutation(api.reviews.start, { apiKey: API_KEY })).toEqual({
      total: 2,
    });

    const first = await t.query(api.reviews.current, { apiKey: API_KEY });
    expect(first).toMatchObject({
      status: "reviewing",
      card: { _id: old },
      position: 0,
      total: 2,
    });

    await t.mutation(api.reviews.rate, {
      apiKey: API_KEY,
      cardId: old,
      rating: "again",
    });
    await t.mutation(api.reviews.rate, {
      apiKey: API_KEY,
      cardId: recent,
      rating: "easy",
    });
    expect(
      await t.query(api.reviews.current, { apiKey: API_KEY })
    ).toMatchObject({
      status: "reviewing",
      card: { _id: old },
      position: 2,
      total: 3,
    });

    await t.mutation(api.reviews.rate, {
      apiKey: API_KEY,
      cardId: old,
      rating: "again",
    });
    expect(await t.query(api.reviews.current, { apiKey: API_KEY })).toEqual({
      status: "finished",
      reviewedCount: 3,
    });
  });

  it("reviews every card of a deck, due or not", async () => {
    const t = await setup();
    const deckId = await t.mutation(api.decks.createDeck, {
      apiKey: API_KEY,
      deckName: "Math",
    });
    const cardId = await createTextCard(t, "in deck", "Math");
    await createTextCard(t, "loose");
    await setDue(t, cardId, 5);

    expect(
      await t.mutation(api.reviews.start, { apiKey: API_KEY, deckId })
    ).toEqual({ total: 1 });
  });

  it("leaves the session alone when rating a card outside it", async () => {
    const t = await setup();
    const inSession = await createTextCard(t, "in session");
    const outside = await createTextCard(t, "outside");
    await setDue(t, outside, 3);
    await t.mutation(api.reviews.start, { apiKey: API_KEY });

    await t.mutation(api.reviews.rate, {
      apiKey: API_KEY,
      cardId: outside,
      rating: "again",
    });
    expect(
      await t.query(api.reviews.current, { apiKey: API_KEY })
    ).toMatchObject({ card: { _id: inSession }, position: 0, total: 1 });
  });

  it("skips cards deleted during the session", async () => {
    const t = await setup();
    const a = await createTextCard(t, "a");
    const b = await createTextCard(t, "b");
    await setDue(t, a, -2);
    await setDue(t, b, -1);
    await t.mutation(api.reviews.start, { apiKey: API_KEY });

    await t.mutation(api.cards.deleteCard, { apiKey: API_KEY, cardId: a });
    expect(
      await t.query(api.reviews.current, { apiKey: API_KEY })
    ).toMatchObject({ card: { _id: b }, total: 1 });
  });

  it("schedules ratings like the web app, previewed by reveal", async () => {
    const t = await setup();
    const cardId = await createTextCard(t, "q");

    const revealed = await t.query(api.reviews.reveal, {
      apiKey: API_KEY,
      cardId,
      now: NOW,
    });
    expect(revealed.card.answer).toBe("q answer");
    expect(revealed.intervalDaysByRating).toEqual({
      again: 1,
      hard: 1,
      medium: 1,
      easy: 4,
    });

    expect(
      await t.mutation(api.reviews.rate, {
        apiKey: API_KEY,
        cardId,
        rating: "easy",
      })
    ).toEqual({ intervalDays: 4, nextReviewDate: NOW + 4 * DAY });
    expect(
      await t.query(api.cards.getCard, { apiKey: API_KEY, cardId })
    ).toMatchObject({ repetitions: 1, lastReviewedAt: NOW });
  });
});
