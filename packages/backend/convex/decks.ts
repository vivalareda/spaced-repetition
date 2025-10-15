import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./users";

export const get = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx, "decks.get");

    return await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createDeck = mutation({
  args: {
    deckName: v.string(),
    deckDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx, "decks.createDeck");

    const userDecks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (
      userDecks.find(
        (d) => d.deckName.toLowerCase() === args.deckName.toLowerCase()
      )
    ) {
      return { error: "deck already exists" };
    }

    const deck = await ctx.db.insert("decks", {
      userId,
      deckName: args.deckName,
      deckDescription: args.deckDescription,
    });
    return deck;
  },
});

export const deleteDeck = mutation({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx, "decks.deleteDeck");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) {
      throw new Error("Deck not found");
    }

    if (deck.userId !== userId) {
      throw new Error("Not authorized to delete this deck");
    }

    const cardsInDeck = await ctx.db
      .query("cards")
      .withIndex("by_user_deck", (q) =>
        q.eq("userId", userId).eq("deckId", args.deckId)
      )
      .collect();

    for (const card of cardsInDeck) {
      await ctx.db.delete(card._id);
    }

    await ctx.db.delete(args.deckId);
    return { success: true };
  },
});

export const getUserDecks = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx, "decks.getUserDecks");

    return await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getUserDecksNames = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx, "decks.getUserDecksNames");

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return decks.map((deck) => deck.deckName);
  },
});

export const getDecksWithCardCount = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx, "decks.getDecksWithCardCount");

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const decksWithCounts = await Promise.all(
      decks.map(async (deck) => {
        const cardCount = await ctx.db
          .query("cards")
          .withIndex("by_user_deck", (q) =>
            q.eq("userId", userId).eq("deckId", deck._id)
          )
          .collect()
          .then((cards) => cards.length);

        return {
          ...deck,
          cardCount,
        };
      })
    );

    return decksWithCounts;
  },
});
