import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { deleteCardAndFiles } from "./cards";
import {
  apiKeyArg,
  getCurrentUserId,
  getOwnedDoc,
  resolveUserId,
} from "./users";

/**
 * Returns `deckName` trimmed, throwing if it is empty or another of the
 * user's decks (other than `exceptDeckId`) already has it, ignoring case.
 */
async function validateDeckName(
  ctx: MutationCtx,
  userId: Id<"users">,
  deckName: string,
  exceptDeckId?: Id<"decks">
) {
  const trimmed = deckName.trim();
  if (trimmed.length === 0) {
    throw new Error("Deck name is required");
  }

  const userDecks = await ctx.db
    .query("decks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const normalizedName = trimmed.toLowerCase();
  if (
    userDecks.some(
      (d) =>
        d._id !== exceptDeckId && d.deckName.toLowerCase() === normalizedName
    )
  ) {
    throw new Error("Deck already exists");
  }
  return trimmed;
}

export const createDeck = mutation({
  args: {
    deckName: v.string(),
    deckDescription: v.optional(v.string()),
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    return await ctx.db.insert("decks", {
      userId,
      deckName: await validateDeckName(ctx, userId, args.deckName),
      deckDescription: args.deckDescription,
    });
  },
});

/** Renames a deck and/or replaces its description. */
export const updateDeck = mutation({
  args: {
    deckId: v.id("decks"),
    deckName: v.optional(v.string()),
    deckDescription: v.optional(v.string()),
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    await getOwnedDoc(ctx, userId, args.deckId);
    await ctx.db.patch(args.deckId, {
      ...(args.deckName !== undefined && {
        deckName: await validateDeckName(
          ctx,
          userId,
          args.deckName,
          args.deckId
        ),
      }),
      ...(args.deckDescription !== undefined && {
        deckDescription: args.deckDescription,
      }),
    });
  },
});

export const deleteDeck = mutation({
  args: {
    deckId: v.id("decks"),
    ...apiKeyArg,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);
    await getOwnedDoc(ctx, userId, args.deckId);
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
  args: apiKeyArg,
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.apiKey);

    return await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// No current caller; kept so clients built before it was replaced by
// `getUserDecks` keep working until they reload.
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
