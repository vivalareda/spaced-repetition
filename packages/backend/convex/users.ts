import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

// ============================================
// Identity -> user lookup helpers
// ============================================

/** The logged-in user's document, or null when logged out or not yet synced. */
export async function findCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/** Like `findCurrentUser`, but throws when there is no logged-in user. */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await findCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  return user._id;
}

/**
 * The calling user: the owner of `apiKey` when one is given (API clients such
 * as the MCP server), otherwise the logged-in user.
 */
export async function resolveUserId(
  ctx: QueryCtx | MutationCtx,
  apiKey: string | undefined
) {
  return apiKey === undefined
    ? await getCurrentUserId(ctx)
    : await getUserByApiKey(ctx, apiKey);
}

/** Loads a card or deck and throws unless it belongs to `userId`. */
export async function getOwnedDoc<Table extends "cards" | "decks">(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  id: Id<Table>
) {
  const doc = await ctx.db.get(id);
  if (!doc) {
    throw new Error("Not found");
  }
  if (doc.userId !== userId) {
    throw new Error("Not authorized");
  }
  return doc;
}

export async function getUserByApiKey(
  ctx: QueryCtx | MutationCtx,
  apiKey: string
) {
  const apiKeyDoc = await ctx.db
    .query("apiKeys")
    .withIndex("by_apiKey", (q) => q.eq("apiKey", apiKey))
    .unique();

  if (!apiKeyDoc) {
    throw new Error("API key not found");
  }

  return apiKeyDoc.userId;
}

async function findApiKeyDoc(ctx: QueryCtx | MutationCtx, user: Doc<"users">) {
  return await ctx.db
    .query("apiKeys")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();
}

/**
 * Optional argument of functions callable both by the logged-in web app and
 * by API clients; see `resolveUserId`.
 */
export const apiKeyArg = { apiKey: v.optional(v.string()) };

// ============================================
// Public functions
// ============================================

export const current = query({
  args: {},
  handler: async (ctx) => await findCurrentUser(ctx),
});

export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const user = await findCurrentUser(ctx);
    if (!user) {
      return null;
    }
    const apiKeyDoc = await findApiKeyDoc(ctx, user);
    return apiKeyDoc?.apiKey ?? null;
  },
});

export const deleteApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const apiKeyDoc = await findApiKeyDoc(ctx, user);
    if (!apiKeyDoc) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(apiKeyDoc._id);
  },
});

/** Returns the user's API key, creating one only if they don't have one yet. */
export const createUserApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const existing = await findApiKeyDoc(ctx, user);
    if (existing) {
      return existing.apiKey;
    }

    const apiKey = crypto.randomUUID();
    await ctx.db.insert("apiKeys", { userId: user._id, apiKey });
    return apiKey;
  },
});

export const upsertFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upsertFromClerk without authentication present");
    }

    const user = await findCurrentUser(ctx);
    if (user) {
      if (user.email === undefined && identity.email !== undefined) {
        await ctx.db.patch(user._id, { email: identity.email });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email,
    });
  },
});
