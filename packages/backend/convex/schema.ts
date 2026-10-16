import { CARD_TYPES } from "@shared/types";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const cardTypeValidator = v.union(
  ...CARD_TYPES.map((cardType) => v.literal(cardType))
);

/** A card's content: what clients provide when creating one. */
export const cardContentFields = {
  question: v.string(),
  questionCode: v.optional(v.string()),
  questionFile: v.optional(v.id("_storage")),

  answer: v.string(),
  answerCode: v.optional(v.string()),
  answerFile: v.optional(v.id("_storage")),

  options: v.optional(v.array(v.string())),
  correctOptionIndex: v.optional(v.number()),

  language: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
};

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  cards: defineTable({
    userId: v.id("users"),
    deckId: v.optional(v.id("decks")),

    // Missing on legacy cards; see `resolveCardType`.
    cardType: v.optional(cardTypeValidator),
    ...cardContentFields,

    nextReviewDate: v.optional(v.number()),
    lastReviewedAt: v.optional(v.number()),
    easeFactor: v.number(),
    intervalDays: v.number(),
    repetitions: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_deck", ["userId", "deckId"])
    .index("by_user_due_date", ["userId", "nextReviewDate"]),

  decks: defineTable({
    userId: v.id("users"),
    deckName: v.string(),
    deckDescription: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    apiKey: v.string(),
  })
    .index("by_apiKey", ["apiKey"])
    .index("by_user", ["userId"]),
});
