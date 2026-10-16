import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteCardAndFiles } from "./cards";
import { getCurrentUserId } from "./users";

export const createDeck = mutation({
  args: {
    deckName: v.string(),
    deckDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const deckName = args.deckName.trim();
    if (deckName.length === 0) {
      throw new Error("Deck name is required");
    }

    const userDecks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const normalizedName = deckName.toLowerCase();
    if (userDecks.some((d) => d.deckName.toLowerCase() === normalizedName)) {
      throw new Error("Deck already exists");
    }

    return await ctx.db.insert("decks", {
      userId,
      deckName,
      deckDescription: args.deckDescription,
    });
  },
});

export const deleteDeck = mutation({
  args: {
    deckId: v.id("decks"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

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
      await deleteCardAndFiles(ctx, card);
    }

    await ctx.db.delete(args.deckId);
    return { success: true };
  },
});

export const getUserDecks = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);

    return await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getUserDecksNames = query({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return decks.map((deck) => deck.deckName);
  },
});
