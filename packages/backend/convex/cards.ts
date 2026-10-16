import {
  INITIAL_SCHEDULING_STATE,
  RATINGS,
  schedule,
  validateImageFile,
} from "@shared/types";
import { type Infer, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { cardContentFields, cardTypeValidator } from "./schema";
import { getCurrentUserId, getOwnedDoc, getUserByApiKey } from "./users";

const MIN_MCQ_OPTIONS = 2;

const difficultyValidator = v.union(
  ...RATINGS.map((rating) => v.literal(rating))
);

const cardSideValidator = v.union(v.literal("question"), v.literal("answer"));

// ============================================
// Card creation
// ============================================

/** Every field a client may set when creating a card, whatever its type. */
const cardInputValidator = v.object({
  cardType: cardTypeValidator,
  ...cardContentFields,
  /** Name of an existing deck. Unknown names leave the card without a deck. */
  deck: v.optional(v.string()),
});

type CardInput = Infer<typeof cardInputValidator>;

/** Rejects stored files that exceed the size limit or aren't allowed images. */
async function assertValidStoredImage(
  ctx: MutationCtx,
  storageId: Id<"_storage">
) {
  const file = await ctx.db.system.get(storageId);
  if (!file) {
    throw new Error("Uploaded file not found");
  }
  const result = validateImageFile({
    size: file.size,
    type: file.contentType,
  });
  if (!result.valid) {
    throw new Error(result.error);
  }
}

/** Throws if the fields required by `input.cardType` are missing or invalid. */
async function validateCardInput(ctx: MutationCtx, input: CardInput) {
  switch (input.cardType) {
    case "text":
      return;

    case "mcq": {
      const { options, correctOptionIndex } = input;
      if (!options || options.length < MIN_MCQ_OPTIONS) {
        throw new Error(
          `MCQ cards require at least ${MIN_MCQ_OPTIONS} options`
        );
      }
      if (
        correctOptionIndex === undefined ||
        !Number.isInteger(correctOptionIndex) ||
        correctOptionIndex < 0 ||
        correctOptionIndex >= options.length
      ) {
        throw new Error(
          "correctOptionIndex must be a valid index within the options array"
        );
      }
      return;
    }

    case "code":
      if (!input.language?.trim()) {
        throw new Error("language is required for code cards");
      }
      return;

    case "image":
      for (const file of [input.questionFile, input.answerFile]) {
        if (file) {
          await assertValidStoredImage(ctx, file);
        }
      }
      return;

    default:
      throw new Error(
        `Card type ${input.cardType satisfies never} not supported`
      );
  }
}

async function findDeckIdByName(
  ctx: MutationCtx,
  userId: Id<"users">,
  deckName: string | undefined
) {
  if (!deckName) {
    return;
  }
  const deck = await ctx.db
    .query("decks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("deckName"), deckName))
    .unique();
  return deck?._id;
}

/**
 * Validates and inserts a new card for `userId`, resolving its deck by name
 * and giving it the initial scheduling state (due immediately).
 */
async function insertCard(
  ctx: MutationCtx,
  userId: Id<"users">,
  input: CardInput
) {
  await validateCardInput(ctx, input);
  const { deck, ...fields } = input;

  return await ctx.db.insert("cards", {
    ...fields,
    userId,
    deckId: await findDeckIdByName(ctx, userId, deck),
    ...INITIAL_SCHEDULING_STATE,
    nextReviewDate: Date.now(),
  });
}

export const createCard = mutation({
  args: {
    ...cardInputValidator.fields,
    // Optional for older clients; cards without a type are plain text.
    cardType: v.optional(cardTypeValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    return await insertCard(ctx, userId, {
      ...args,
      cardType: args.cardType ?? "text",
    });
  },
});

/** API-key (MCP) entry point for text cards, or MCQ cards when options are given. */
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
  handler: async (ctx, { apiKey, ...input }) => {
    const userId = await getUserByApiKey(ctx, apiKey);
    const isMcq =
      input.options !== undefined || input.correctOptionIndex !== undefined;
    return await insertCard(ctx, userId, {
      ...input,
      cardType: isMcq ? "mcq" : "text",
    });
  },
});

/** API-key (MCP) entry point for code cards. */
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
  handler: async (ctx, { apiKey, ...input }) => {
    const userId = await getUserByApiKey(ctx, apiKey);
    return await insertCard(ctx, userId, { ...input, cardType: "code" });
  },
});

// ============================================
// Card lookup
// ============================================

/** Deletes a card together with any images it references in storage. */
export async function deleteCardAndFiles(ctx: MutationCtx, card: Doc<"cards">) {
  // Skip files that are already gone (or shared by both sides) so one stale
  // reference can't make the card, or its whole deck, undeletable.
  const files = new Set([card.questionFile, card.answerFile]);
  for (const file of files) {
    if (file && (await ctx.db.system.get(file))) {
      await ctx.storage.delete(file);
    }
  }
  await ctx.db.delete(card._id);
}

export const get = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);

    return await ctx.db
      .query("cards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Cards due at or before `now`. The client passes `now` (rounded to the
 * minute) because Convex does not re-run a query as time passes, so a
 * `Date.now()` here would go stale.
 */
export const getDueToday = query({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    return await ctx.db
      .query("cards")
      .withIndex("by_user_due_date", (q) =>
        q.eq("userId", userId).lte("nextReviewDate", args.now)
      )
      .collect();
  },
});

/** URL of the image on one side of a card the caller owns, or null if none. */
export const getImageUrl = query({
  args: {
    cardId: v.id("cards"),
    side: cardSideValidator,
  },
  handler: async (ctx, args): Promise<string | null> => {
    const card = await getOwnedDoc(ctx, args.cardId);
    const file = args.side === "question" ? card.questionFile : card.answerFile;
    return file ? await ctx.storage.getUrl(file) : null;
  },
});

// ============================================
// Card updates
// ============================================

export const deleteCard = mutation({
  args: {
    cardId: v.id("cards"),
  },
  handler: async (ctx, args) => {
    const card = await getOwnedDoc(ctx, args.cardId);
    await deleteCardAndFiles(ctx, card);
  },
});

export const moveCardToDeck = mutation({
  args: {
    cardId: v.id("cards"),
    deckId: v.optional(v.id("decks")),
  },
  handler: async (ctx, args) => {
    await getOwnedDoc(ctx, args.cardId);
    if (args.deckId) {
      await getOwnedDoc(ctx, args.deckId);
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
    difficulty: difficultyValidator,
  },
  handler: async (ctx, args) => {
    const card = await getOwnedDoc(ctx, args.cardId);
    const now = Date.now();

    await ctx.db.patch(args.cardId, {
      ...schedule(card, args.difficulty, now),
      lastReviewedAt: now,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserId(ctx);

    // Early rejection based on what the client declares; the stored file is
    // re-checked in `insertCard` since these values can't be trusted.
    const result = validateImageFile({
      size: args.fileSize,
      type: args.fileType,
    });
    if (!result.valid) {
      throw new Error(result.error);
    }

    return await ctx.storage.generateUploadUrl();
  },
});
