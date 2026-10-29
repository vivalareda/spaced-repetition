// biome-ignore-all lint/style/noMagicNumbers: dates and intervals read more clearly as literals
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ConvexHttpClient } from "convex/browser";
import { type FunctionReference, getFunctionName } from "convex/server";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createApp } from "./app.js";

const API_KEY = "test-key";
const NOW = Date.UTC(2026, 0, 10);
const DAY = 86_400_000;

// ============================================
// Fake backend
// ============================================

type Handler = (args: Record<string, unknown>) => unknown;

/** Backend functions by name ("module:function"); unknown calls fail. */
let handlers: Record<string, Handler> = {};

const call = vi.fn(
  async (ref: FunctionReference<"query" | "mutation">, args: unknown) => {
    const name = getFunctionName(ref);
    const handler = handlers[name];
    if (!handler) {
      throw new Error(`Unexpected backend call: ${name}`);
    }
    return await handler(args as Record<string, unknown>);
  }
);
const client = { query: call, mutation: call } as unknown as ConvexHttpClient;

/** Arguments of every call made to backend function `name`. */
function callsTo(name: string) {
  return call.mock.calls
    .filter(([ref]) => getFunctionName(ref) === name)
    .map(([, args]) => args);
}

const MATH = { _id: "deck-math", deckName: "Math", deckDescription: "Numbers" };
const FRENCH = { _id: "deck-french", deckName: "French" };

function makeCard(id: string, fields: Record<string, unknown> = {}) {
  return {
    _id: id,
    cardType: "text",
    question: `${id} question`,
    answer: `${id} answer`,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: NOW,
    ...fields,
  };
}

const MCQ_CARD = makeCard("card-mcq", {
  cardType: "mcq",
  deckId: MATH._id,
  question: "2 + 2?",
  answer: "Basic arithmetic",
  options: ["3", "4", "5"],
  correctOptionIndex: 1,
});
const TEXT_CARD = makeCard("card-text", { nextReviewDate: NOW + 2 * DAY });

// ============================================
// MCP client
// ============================================

let server: Server;
let mcp: Client;

beforeAll(async () => {
  server = createApp(client).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  call.mockClear();
  handlers = {
    "decks:getUserDecks": () => [MATH, FRENCH],
    "cards:get": () => [MCQ_CARD, TEXT_CARD],
    "cards:getDueToday": () => [MCQ_CARD],
  };
  const port = (server.address() as AddressInfo).port;
  const transport = new StreamableHTTPClientTransport(
    new URL(`http://127.0.0.1:${port}/mcp`),
    { requestInit: { headers: { authorization: `Bearer ${API_KEY}` } } }
  );
  mcp = new Client({ name: "test", version: "1.0.0" });
  await mcp.connect(transport);
});

afterEach(async () => {
  await mcp.close();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function callTool(name: string, args: Record<string, unknown> = {}) {
  const result = await mcp.callTool({ name, arguments: args });
  return result as {
    isError?: boolean;
    structuredContent?: Record<string, unknown>;
    content: { type: string; text: string }[];
  };
}

async function callToolOk(name: string, args: Record<string, unknown> = {}) {
  const result = await callTool(name, args);
  if (result.isError) {
    throw new Error(`${name} failed: ${result.content[0]?.text}`);
  }
  return result.structuredContent as Record<string, unknown>;
}

// ============================================
// Tests
// ============================================

describe("review tools", () => {
  it("starts a due-cards session and asks the question without its answer", async () => {
    let started = false;
    handlers["reviews:current"] = () =>
      started
        ? {
            status: "reviewing",
            card: MCQ_CARD,
            questionImageUrl: null,
            position: 0,
            total: 1,
          }
        : { status: "none" };
    handlers["reviews:start"] = () => {
      started = true;
      return { total: 1 };
    };

    const result = await callToolOk("get_next_card");

    expect(callsTo("reviews:start")).toEqual([{ apiKey: API_KEY }]);
    expect(result).toEqual({
      status: "reviewing",
      progress: { current: 1, total: 1, remaining: 1 },
      card: {
        cardId: "card-mcq",
        type: "mcq",
        deck: "Math",
        question: "2 + 2?",
        options: ["A. 3", "B. 4", "C. 5"],
      },
    });
    expect(JSON.stringify(result)).not.toContain("Basic arithmetic");
  });

  it("reports when nothing is due, with the next due date", async () => {
    handlers["reviews:current"] = () => ({ status: "none" });
    handlers["reviews:start"] = () => ({ total: 0 });

    expect(await callToolOk("get_next_card")).toEqual({
      status: "nothing_due",
      message: "No cards are due right now.",
      nextDueAt: new Date(NOW).toISOString(),
    });
  });

  it("reviews a whole deck given its name in any case", async () => {
    handlers["reviews:start"] = () => ({ total: 0 });

    expect(await callToolOk("start_review", { deck: "math" })).toMatchObject({
      status: "empty",
    });
    expect(callsTo("reviews:start")).toEqual([
      { apiKey: API_KEY, deckId: MATH._id },
    ]);
  });

  it("reveals the answer, correct option and rating previews", async () => {
    handlers["reviews:reveal"] = () => ({
      card: MCQ_CARD,
      questionImageUrl: null,
      answerImageUrl: null,
      intervalDaysByRating: { again: 1, hard: 1, medium: 1, easy: 4 },
    });

    expect(await callToolOk("reveal_answer", { cardId: "card-mcq" })).toEqual({
      cardId: "card-mcq",
      question: "2 + 2?",
      answer: "Basic arithmetic",
      correctOption: "B. 4",
      nextIntervalDaysByRating: { again: 1, hard: 1, medium: 1, easy: 4 },
    });
  });

  it('rates with "good" as "medium" and returns the session state', async () => {
    handlers["reviews:rate"] = () => ({
      intervalDays: 6,
      nextReviewDate: NOW + 6 * DAY,
    });
    handlers["reviews:current"] = () => ({
      status: "finished",
      reviewedCount: 1,
    });

    const result = await callToolOk("rate_card", {
      cardId: "card-mcq",
      rating: "good",
    });

    expect(callsTo("reviews:rate")).toEqual([
      { apiKey: API_KEY, cardId: "card-mcq", rating: "medium" },
    ]);
    expect(result).toMatchObject({
      rating: "medium",
      nextIntervalDays: 6,
      nextReviewAt: new Date(NOW + 6 * DAY).toISOString(),
      session: { status: "finished", reviewedCount: 1 },
    });
  });

  it("reports a saved rating even if the session can't be read", async () => {
    handlers["reviews:rate"] = () => ({
      intervalDays: 1,
      nextReviewDate: NOW + DAY,
    });
    handlers["reviews:current"] = () => {
      throw new Error("network down");
    };

    expect(
      await callToolOk("rate_card", { cardId: "card-mcq", rating: "hard" })
    ).toMatchObject({
      nextIntervalDays: 1,
      session: { status: "unknown" },
    });
  });

  it("rejects unknown ratings", async () => {
    await expect(
      callTool("rate_card", { cardId: "card-mcq", rating: "perfect" })
    ).rejects.toThrow("Invalid arguments");
  });

  it("summarizes what is due today", async () => {
    handlers["reviews:current"] = () => ({ status: "none" });

    expect(await callToolOk("get_study_overview")).toEqual({
      dueNowCount: 1,
      totalCards: 2,
      deckCount: 2,
      cardsWithoutDeck: 1,
      nextDueAt: null,
      dueCards: [
        {
          cardId: "card-mcq",
          type: "mcq",
          deck: "Math",
          question: "2 + 2?",
          repetitions: 0,
          dueAt: new Date(NOW).toISOString(),
        },
      ],
      reviewSession: { status: "none" },
    });
  });
});

describe("library tools", () => {
  it("lists decks with card and due counts", async () => {
    expect(await callToolOk("list_decks")).toEqual({
      decks: [
        {
          deckId: MATH._id,
          name: "Math",
          description: "Numbers",
          cardCount: 1,
          dueNowCount: 1,
        },
        { deckId: FRENCH._id, name: "French", cardCount: 0, dueNowCount: 0 },
      ],
      withoutDeck: { cardCount: 1, dueNowCount: 0 },
    });
  });

  it("lists cards without a deck", async () => {
    expect(await callToolOk("list_cards", { withoutDeck: true })).toMatchObject(
      { count: 1, cards: [{ cardId: "card-text", deck: null }] }
    );
  });

  it("explains which decks exist when a deck is unknown", async () => {
    const result = await callTool("list_cards", { deck: "Spanish" });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe(
      'No deck named "Spanish". Existing decks: "Math", "French".'
    );
  });

  it("relays backend errors without their stack trace", async () => {
    handlers["decks:createDeck"] = () => {
      throw new Error(
        "[Request ID: abc] Server Error\nUncaught Error: Deck already exists\n    at handler (../convex/decks.ts:20:11)"
      );
    };

    const result = await callTool("create_deck", { name: "math" });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe("Deck already exists");
  });

  it("moves a card out of its deck", async () => {
    handlers["cards:moveCardToDeck"] = () => ({ success: true });

    expect(
      await callToolOk("move_card", { cardId: "card-mcq", deck: null })
    ).toEqual({ cardId: "card-mcq", deck: null });
    expect(callsTo("cards:moveCardToDeck")).toEqual([
      { apiKey: API_KEY, cardId: "card-mcq" },
    ]);
  });

  it("only deletes once confirmed", async () => {
    handlers["cards:deleteCard"] = () => null;

    await expect(
      callTool("delete_card", { cardId: "card-mcq" })
    ).rejects.toThrow("Invalid arguments");
    expect(callsTo("cards:deleteCard")).toEqual([]);

    await callToolOk("delete_card", { cardId: "card-mcq", confirm: true });
    expect(callsTo("cards:deleteCard")).toEqual([
      { apiKey: API_KEY, cardId: "card-mcq" },
    ]);
  });

  it("deletes a deck and reports how many cards went with it", async () => {
    handlers["decks:deleteDeck"] = () => ({ success: true });

    expect(
      await callToolOk("delete_deck", { deck: "Math", confirm: true })
    ).toEqual({ deletedDeck: "Math", deletedCardCount: 1 });
  });

  it("updates a card and returns it in full", async () => {
    handlers["cards:updateCard"] = () => null;
    handlers["reviews:reveal"] = () => ({
      card: { ...MCQ_CARD, question: "3 + 1?" },
      questionImageUrl: null,
      answerImageUrl: null,
      intervalDaysByRating: { again: 1, hard: 1, medium: 1, easy: 4 },
    });

    const result = await callToolOk("update_card", {
      cardId: "card-mcq",
      question: "3 + 1?",
    });

    expect(callsTo("cards:updateCard")).toEqual([
      { apiKey: API_KEY, cardId: "card-mcq", question: "3 + 1?" },
    ]);
    expect(result).toMatchObject({
      question: "3 + 1?",
      options: ["3", "4", "5"],
      correctOptionIndex: 1,
      correctOption: "B. 4",
      schedule: { repetitions: 0, dueAt: new Date(NOW).toISOString() },
    });
  });
});

describe("card creation", () => {
  it("files a card under the matching deck name", async () => {
    handlers["cards:createQuestionCard"] = () => "card-new";

    await callToolOk("create_flashcard", {
      question: "q",
      answer: "a",
      deck: "MATH",
    });
    expect(callsTo("cards:createQuestionCard")).toEqual([
      { apiKey: API_KEY, question: "q", answer: "a", deck: "Math" },
    ]);
  });

  it("uploads base64 images before creating an image card", async () => {
    const realFetch = globalThis.fetch;
    const uploads: Blob[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input) === "https://upload.test/") {
        uploads.push(init?.body as Blob);
        return Response.json({ storageId: "storage-1" });
      }
      return await realFetch(input, init);
    });
    handlers["cards:generateUploadUrl"] = () => "https://upload.test/";
    handlers["cards:createCard"] = () => "card-image";

    const result = await callToolOk("create_image_flashcard", {
      question: "Which flag?",
      answer: "France",
      questionImage: {
        base64: `data:image/png;base64,${Buffer.from("png").toString("base64")}`,
      },
    });

    expect(result.id).toBe("card-image");
    expect(callsTo("cards:generateUploadUrl")).toEqual([
      { apiKey: API_KEY, fileSize: 3, fileType: "image/png" },
    ]);
    expect(await uploads[0]?.text()).toBe("png");
    expect(callsTo("cards:createCard")).toEqual([
      {
        apiKey: API_KEY,
        cardType: "image",
        question: "Which flag?",
        answer: "France",
        questionFile: "storage-1",
      },
    ]);
  });

  it("uploads nothing when one of the images is rejected", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    handlers["cards:generateUploadUrl"] = (args) => {
      if (args.fileType !== "image/png") {
        throw new Error("Uncaught Error: Unsupported file type");
      }
      return "https://upload.test/";
    };

    const result = await callTool("create_image_flashcard", {
      question: "q",
      answer: "a",
      questionImage: { base64: "cG5n", mimeType: "image/png" },
      answerImage: { base64: "Z2lm", mimeType: "image/gif" },
    });

    expect(result.content[0]?.text).toBe("Unsupported file type");
    expect(
      fetchSpy.mock.calls.filter(([input]) => String(input).includes("upload"))
    ).toEqual([]);
    expect(callsTo("cards:createCard")).toEqual([]);
  });

  it("refuses non-https image URLs", async () => {
    const result = await callTool("create_image_flashcard", {
      question: "q",
      answer: "a",
      questionImage: { url: "http://example.com/a.png" },
    });
    expect(result.content[0]?.text).toBe("Image URLs must use https");
    expect(callsTo("cards:createCard")).toEqual([]);
  });
});
