// Tools for reviewing cards conversationally: ask the next card, reveal its
// answer, rate it. They drive the backend's review session (`convex/reviews.ts`),
// which follows the web app's: due cards most overdue first, and an "again"
// card comes back once at the end of the session.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "@spaced-repetition-monorepo/backend/convex/_generated/api.js";
import type { Id } from "@spaced-repetition-monorepo/backend/convex/_generated/dataModel.js";
import type { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import {
  answerView,
  cardSummary,
  deckNames,
  earliestDueAt,
  findDeck,
  loadDecks,
  questionView,
} from "./card-views.js";
import { registerTool, type ToolContext } from "./tool-helpers.js";

const DEFAULT_DUE_LIST_LIMIT = 50;
const OVERVIEW_DUE_LIST_LIMIT = 10;

// The web app's ratings, plus "good" as another name for "medium".
const RATING_INPUTS = ["again", "hard", "medium", "good", "easy"] as const;
type RatingInput = (typeof RATING_INPUTS)[number];

function toRating(rating: RatingInput) {
  return rating === "good" ? "medium" : rating;
}

const cardIdInput = z
  .string()
  .describe("The card's id (cardId), as returned by other tools");

const asCardId = (cardId: string) => cardId as Id<"cards">;

/** The review session's state, with the current card's question if any. */
async function sessionView(context: ToolContext) {
  const { client, apiKey } = context;
  const session = await client.query(api.reviews.current, { apiKey });
  switch (session.status) {
    case "none":
      return { status: "none" as const };
    case "finished":
      return {
        status: "finished" as const,
        reviewedCount: session.reviewedCount,
        message: `Review session finished: ${session.reviewedCount} rating(s) given.`,
      };
    case "reviewing": {
      const names = deckNames(await loadDecks(context));
      return {
        status: "reviewing" as const,
        progress: {
          current: session.position + 1,
          total: session.total,
          remaining: session.total - session.position,
        },
        card: questionView(session.card, names, session.questionImageUrl),
      };
    }
    default:
      throw new Error(`Unknown session status: ${session satisfies never}`);
  }
}

/** Starts a session, or explains why there is nothing to review. */
async function startSession(context: ToolContext, deck: string | undefined) {
  const { client, apiKey } = context;
  const deckDoc = deck ? findDeck(await loadDecks(context), deck) : undefined;
  const { total } = await client.mutation(api.reviews.start, {
    apiKey,
    deckId: deckDoc?._id,
  });
  if (total > 0) {
    return await sessionView(context);
  }
  if (deckDoc) {
    return {
      status: "empty" as const,
      message: `Deck "${deckDoc.deckName}" has no cards.`,
    };
  }
  const cards = await client.query(api.cards.get, { apiKey });
  return {
    status: "nothing_due" as const,
    message: "No cards are due right now.",
    nextDueAt: earliestDueAt(cards),
  };
}

export function registerReviewTools(
  server: McpServer,
  client: ConvexHttpClient
) {
  registerTool(server, client, "get_study_overview", {
    title: "Get study overview",
    description:
      "Summary of what needs to be done: how many cards are due now, the first due cards, totals, and the progress of the current review session. Call this when the user asks what they have to study today.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
    run: async (_args, context) => {
      const { apiKey } = context;
      const [cards, due, decks, session] = await Promise.all([
        client.query(api.cards.get, { apiKey }),
        client.query(api.cards.getDueToday, { apiKey, now: Date.now() }),
        loadDecks(context),
        sessionView(context),
      ]);
      const names = deckNames(decks);
      return {
        dueNowCount: due.length,
        totalCards: cards.length,
        deckCount: decks.length,
        cardsWithoutDeck: cards.filter((card) => !card.deckId).length,
        nextDueAt: due.length > 0 ? null : earliestDueAt(cards),
        dueCards: due
          .slice(0, OVERVIEW_DUE_LIST_LIMIT)
          .map((card) => cardSummary(card, names)),
        reviewSession: session,
      };
    },
  });

  registerTool(server, client, "list_due_cards", {
    title: "List due cards",
    description:
      "List the cards due for review now (questions only, most overdue first), optionally only those of one deck.",
    inputSchema: {
      deck: z
        .string()
        .optional()
        .describe("Only cards of this deck (name or id)"),
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe(
          `Maximum number of cards to list (default ${DEFAULT_DUE_LIST_LIMIT})`
        ),
    },
    annotations: { readOnlyHint: true },
    run: async ({ deck, limit = DEFAULT_DUE_LIST_LIMIT }, context) => {
      const decks = await loadDecks(context);
      const deckId = deck ? findDeck(decks, deck)._id : undefined;
      const due = await client.query(api.cards.getDueToday, {
        apiKey: context.apiKey,
        now: Date.now(),
      });
      const matching = deckId
        ? due.filter((card) => card.deckId === deckId)
        : due;
      const names = deckNames(decks);
      return {
        dueCount: matching.length,
        cards: matching.slice(0, limit).map((card) => cardSummary(card, names)),
      };
    },
  });

  registerTool(server, client, "start_review", {
    title: "Start review session",
    description:
      "Start a new review session, replacing any current one, and return its first card's question. Without a deck it reviews every card due now; with a deck it reviews every card of that deck, due or not. Ask the returned question, then use reveal_answer and rate_card.",
    inputSchema: {
      deck: z
        .string()
        .optional()
        .describe("Review this whole deck (name or id) instead of due cards"),
    },
    run: async ({ deck }, context) => await startSession(context, deck),
  });

  registerTool(server, client, "get_next_card", {
    title: "Get next card",
    description:
      "Return the question of the card to review next, without its answer. Continues the current review session; if there is none (or it is finished) it starts one over the cards due now. Ask the user the question and wait for their answer before calling reveal_answer.",
    inputSchema: {},
    run: async (_args, context) => {
      const session = await sessionView(context);
      return session.status === "reviewing"
        ? session
        : await startSession(context, undefined);
    },
  });

  registerTool(server, client, "reveal_answer", {
    title: "Reveal answer",
    description:
      "Return a card's answer (and, for multiple-choice cards, the correct option) so it can be compared with the user's answer, plus the next interval each rating would give. Then ask the user how well they knew it and call rate_card.",
    inputSchema: { cardId: cardIdInput },
    annotations: { readOnlyHint: true },
    run: async ({ cardId }, { apiKey }) => {
      const revealed = await client.query(api.reviews.reveal, {
        apiKey,
        cardId: asCardId(cardId),
        now: Date.now(),
      });
      return {
        cardId,
        question: revealed.card.question,
        ...answerView(revealed.card, revealed.answerImageUrl),
        nextIntervalDaysByRating: revealed.intervalDaysByRating,
      };
    },
  });

  registerTool(server, client, "rate_card", {
    title: "Rate card",
    description:
      'Record how well the user knew a card and reschedule it exactly like the web app\'s rating buttons. "again": forgot it (seen again tomorrow, and once more at the end of this session); "hard"; "medium" (also accepted as "good"); "easy": longest next interval. Returns the new schedule and the next card\'s question, if any.',
    inputSchema: {
      cardId: cardIdInput,
      rating: z
        .enum(RATING_INPUTS)
        .describe('again | hard | medium (= "good") | easy'),
    },
    run: async ({ cardId, rating }, context) => {
      const result = await client.mutation(api.reviews.rate, {
        apiKey: context.apiKey,
        cardId: asCardId(cardId),
        rating: toRating(rating),
      });
      return {
        cardId,
        rating: toRating(rating),
        nextIntervalDays: result.intervalDays,
        nextReviewAt: new Date(result.nextReviewDate).toISOString(),
        // The rating is saved at this point: failing now would get it retried
        // and applied twice.
        session: await sessionView(context).catch(() => ({
          status: "unknown" as const,
          message: "Rating saved. Call get_next_card to continue.",
        })),
      };
    },
  });
}
