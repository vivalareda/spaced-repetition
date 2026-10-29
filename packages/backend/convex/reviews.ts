// Review sessions for API clients (the MCP server). They follow the web app's
// sessions: a queue of cards reviewed in order, where an "again" card comes
// back once at the end. The web app keeps its queue in the browser; this one
// is stored per user so it survives reconnections.

import {
  completeReview,
  RATINGS,
  type ReviewQueue,
  schedule,
  startReviewQueue,
} from "@shared/types";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { difficultyValidator, rateCard } from "./cards";
import { withCardType } from "./types/convexTypes";
import { apiKeyArg, getOwnedDoc, resolveUserId } from "./users";

async function findSession(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("reviewSessions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/** URL of the image on one side of `card`, or null if it has none. */
async function imageUrl(
  ctx: QueryCtx,
  card: Doc<"cards">,
  side: "question" | "answer"
) {
  const file = side === "question" ? card.questionFile : card.answerFile;
  return file ? await ctx.storage.getUrl(file) : null;
}

/**
 * Starts a new session, replacing any current one: over every card of
 * `deckId` when given (like "Review deck"), otherwise over every card due by
 * now, most overdue first (like "Start review").
 */
export const start = mutation({
  args: {
    deckId: v.optional(v.id("decks")),
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    const { deckId } = args;
    let cards: Doc<"cards">[];
    if (deckId) {
      await getOwnedDoc(ctx, userId, deckId);
      cards = await ctx.db
        .query("cards")
        .withIndex("by_user_deck", (q) =>
          q.eq("userId", userId).eq("deckId", deckId)
        )
        .collect();
    } else {
      cards = await ctx.db
        .query("cards")
        .withIndex("by_user_due_date", (q) =>
          q.eq("userId", userId).lte("nextReviewDate", Date.now())
        )
        .collect();
    }

    const queue = startReviewQueue(cards.map((card) => card._id));
    const session = await findSession(ctx, userId);
    if (session) {
      await ctx.db.patch(session._id, queue);
    } else {
      await ctx.db.insert("reviewSessions", { userId, ...queue });
    }
    return { total: queue.remaining.length };
  },
});

/**
 * The session's current card (with the URL of its question image, if any)
 * and progress. Cards deleted since the session started are skipped.
 */
export const current = query({
  args: apiKeyArg,
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    const session = await findSession(ctx, userId);
    if (!session) {
      return { status: "none" as const };
    }

    const { reviewedCount } = session;
    const remaining: Doc<"cards">[] = [];
    for (const id of session.remaining) {
      const remainingCard = await ctx.db.get(id);
      if (remainingCard) {
        remaining.push(remainingCard);
      }
    }

    const [card] = remaining;
    if (!card) {
      return { status: "finished" as const, reviewedCount };
    }
    return {
      status: "reviewing" as const,
      card: withCardType(card),
      questionImageUrl: await imageUrl(ctx, card, "question"),
      /** 0-based position of the current card in the session. */
      position: reviewedCount,
      total: reviewedCount + remaining.length,
    };
  },
});

/**
 * A card with the URLs of both its images, and the interval (in days) each
 * rating would give it if rated at `now`, as shown on the web app's rating
 * buttons.
 */
export const reveal = query({
  args: {
    cardId: v.id("cards"),
    now: v.number(),
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    const card = await getOwnedDoc(ctx, userId, args.cardId);
    return {
      card: withCardType(card),
      questionImageUrl: await imageUrl(ctx, card, "question"),
      answerImageUrl: await imageUrl(ctx, card, "answer"),
      intervalDaysByRating: Object.fromEntries(
        RATINGS.map((rating) => [
          rating,
          schedule(card, rating, args.now).intervalDays,
        ])
      ) as Record<(typeof RATINGS)[number], number>,
    };
  },
});

/**
 * Rates a card exactly like the web app does (see `cards.updateNextReviewDate`)
 * and, if it is still to review in the session, moves the session on. Returns the card's new
 * schedule.
 */
export const rate = mutation({
  args: {
    cardId: v.id("cards"),
    rating: difficultyValidator,
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    const card = await getOwnedDoc(ctx, userId, args.cardId);
    const next = await rateCard(ctx, card, args.rating);

    const session = await findSession(ctx, userId);
    if (session?.remaining.includes(card._id)) {
      const queue: ReviewQueue<Id<"cards">> = session;
      await ctx.db.patch(
        session._id,
        completeReview(queue, card._id, args.rating)
      );
    }
    return {
      intervalDays: next.intervalDays,
      nextReviewDate: next.nextReviewDate,
    };
  },
});
