import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, MEGABYTE } from "@shared/types";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId, getUserByApiKey } from "./users";

const INITIAL_EASE_FACTOR = 2.5;

const MIN_EASE_FACTOR = 1.3;

const AGAIN_EASE_PENALTY = 0.2;
const HARD_EASE_PENALTY = 0.15;
const EASY_EASE_BONUS = 0.15;

const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_INTERVAL_BONUS = 1.3;

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
const LEARNING_STEP_1 = 1;
const LEARNING_STEP_2 = 6;

const HARD_LEARNING_STEP_1 = 1;
const HARD_LEARNING_STEP_2 = 3;

const EASY_LEARNING_STEP_1 = 4;
const EASY_LEARNING_STEP_2 = 10;

const AGAIN_INTERVAL = 1;

export const get = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);

    return await ctx.db
      .query("cards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createCard = mutation({
  args: {
    cardType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("code"),
        v.literal("image"),
        v.literal("mcq")
      )
    ),

    question: v.string(),
    questionCode: v.optional(v.string()),
    questionFile: v.optional(v.id("_storage")),

    answer: v.string(),
    answerCode: v.optional(v.string()),
    answerFile: v.optional(v.id("_storage")),

    options: v.optional(v.array(v.string())),
    correctOptionIndex: v.optional(v.number()),

    language: v.optional(v.string()),
    deck: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    let deckId: Id<"decks"> | undefined;
    if (args.deck) {
      const deck = await ctx.db
        .query("decks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("deckName"), args.deck))
        .unique();
      deckId = deck?._id;
    }

    if (args.cardType === "mcq") {
      if (!args.options || args.options.length < 2) {
        throw new Error("MCQ cards require at least 2 options");
      }
      if (
        args.correctOptionIndex === undefined ||
        args.correctOptionIndex < 0 ||
        args.correctOptionIndex >= args.options.length
      ) {
        throw new Error(
          "correctOptionIndex must be a valid index within the options array"
        );
      }
    }

    const newCard = await ctx.db.insert("cards", {
      userId,
      deckId,
      cardType: args.cardType,

      question: args.question,
      questionCode: args.questionCode,
      questionFile: args.questionFile,

      answer: args.answer,
      answerCode: args.answerCode,
      answerFile: args.answerFile,

      options: args.options,
      correctOptionIndex: args.correctOptionIndex,

      language: args.language,
      tags: args.tags,
      nextReviewDate: Date.now(),
      easeFactor: INITIAL_EASE_FACTOR,
      intervalDays: 0,
      repetitions: 0,
    });

    return newCard;
  },
});

export const createQuestionCard = mutation({
  args: {
    apiKey: v.string(),
    question: v.string(),
    answer: v.string(),
    deck: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    options: v.optional(v.array(v.string())),
    correctOptionIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserByApiKey(ctx, args.apiKey);

    const isMcq =
      args.options !== undefined && args.correctOptionIndex !== undefined;

    const newCard = await ctx.db.insert("cards", {
      userId,
      cardType: isMcq ? "mcq" : "text",
      question: args.question,
      answer: args.answer,
      options: args.options,
      correctOptionIndex: args.correctOptionIndex,
      nextReviewDate: Date.now(),
      easeFactor: INITIAL_EASE_FACTOR,
      intervalDays: 0,
      repetitions: 0,
    });

    return newCard;
  },
});

export const createCodeCard = mutation({
  args: {
    apiKey: v.string(),
    question: v.string(),
    answer: v.string(),
    language: v.string(),
    questionCode: v.string(),
    answerCode: v.optional(v.string()),
    deck: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserByApiKey(ctx, args.apiKey);

    if (args.language.trim().length === 0) {
      throw new Error("language is required for code cards");
    }
    if (args.questionCode.trim().length === 0) {
      throw new Error("questionCode is required for code cards");
    }

    let deckId: Id<"decks"> | undefined;
    if (args.deck) {
      const deck = await ctx.db
        .query("decks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("deckName"), args.deck))
        .unique();

      // Deck is optional: if the provided name doesn't match an existing deck,
      // we create the card without a deck assignment.
      deckId = deck?._id;
    }

    const newCard = await ctx.db.insert("cards", {
      userId,
      deckId,
      cardType: "code",
      question: args.question,
      questionCode: args.questionCode,
      answer: args.answer,
      answerCode: args.answerCode,
      language: args.language,
      tags: args.tags,
      nextReviewDate: Date.now(),
      easeFactor: INITIAL_EASE_FACTOR,
      intervalDays: 0,
      repetitions: 0,
    });

    return newCard;
  },
});

export const getDueToday = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    const today = Date.now();
    return await ctx.db
      .query("cards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.lte(q.field("nextReviewDate"), today))
      .collect();
  },
});

export const getByDeckId = query({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    return await ctx.db
      .query("cards")
      .withIndex("by_user_deck", (q) =>
        q.eq("userId", userId).eq("deckId", args.deckId)
      )
      .collect();
  },
});

export const deleteCard = mutation({
  args: {
    cardId: v.id("cards"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const card = await ctx.db.get(args.cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.userId !== userId) {
      throw new Error("Not authorized to delete this card");
    }

    await ctx.db.delete(args.cardId);
  },
});

export const moveCardToDeck = mutation({
  args: {
    cardId: v.id("cards"),
    deckId: v.optional(v.id("decks")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const card = await ctx.db.get(args.cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.userId !== userId) {
      throw new Error("Not authorized to modify this card");
    }

    if (args.deckId) {
      const deck = await ctx.db.get(args.deckId);
      if (!deck) {
        throw new Error("Deck not found");
      }

      if (deck.userId !== userId) {
        throw new Error("Not authorized to move card to this deck");
      }
    }

    await ctx.db.patch(args.cardId, {
      deckId: args.deckId,
    });

    return { success: true };
  },
});

export const updateNextReviewDate = mutation({
  args: {
    cardId: v.id("cards"),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const card = await ctx.db.get(args.cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.userId !== userId) {
      throw new Error("Not authorized to update this card");
    }

    let { easeFactor, intervalDays, repetitions } = card;
    const now = Date.now();

    switch (args.difficulty) {
      case "again":
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - AGAIN_EASE_PENALTY);
        repetitions = 0;
        intervalDays = AGAIN_INTERVAL;
        break;

      case "hard":
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - HARD_EASE_PENALTY);
        if (repetitions === 0) {
          intervalDays = HARD_LEARNING_STEP_1;
        } else if (repetitions === 1) {
          intervalDays = HARD_LEARNING_STEP_2;
        } else {
          intervalDays = Math.max(
            intervalDays * HARD_INTERVAL_MULTIPLIER,
            intervalDays + 1
          );
        }
        repetitions += 1;
        break;

      case "medium":
        if (repetitions === 0) {
          intervalDays = LEARNING_STEP_1;
        } else if (repetitions === 1) {
          intervalDays = LEARNING_STEP_2;
        } else {
          intervalDays *= easeFactor;
        }
        repetitions += 1;
        break;

      case "easy":
        easeFactor += EASY_EASE_BONUS;
        if (repetitions === 0) {
          intervalDays = EASY_LEARNING_STEP_1;
        } else if (repetitions === 1) {
          intervalDays = EASY_LEARNING_STEP_2;
        } else {
          intervalDays *= easeFactor * EASY_INTERVAL_BONUS;
        }
        repetitions += 1;
        break;

      default:
        throw new Error("Invalid difficulty");
    }

    const nextReviewDate = now + intervalDays * MS_PER_DAY;

    await ctx.db.patch(args.cardId, {
      easeFactor,
      intervalDays,
      repetitions,
      nextReviewDate,
      lastReviewedAt: now,
    });
  },
});

export const getImageUrl = query({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => await ctx.storage.getUrl(args.imageStorageId),
});

export const generateUploadUrl = mutation({
  args: {
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserId(ctx);

    if (args.fileSize > MAX_FILE_SIZE) {
      throw new Error(
        `File too large. Maximum size is ${MAX_FILE_SIZE / MEGABYTE}MB`
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(args.fileType)) {
      throw new Error(
        `File type not allowed. Accepted types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
      );
    }

    return await ctx.storage.generateUploadUrl();
  },
});
