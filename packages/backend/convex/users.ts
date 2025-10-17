import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      return null;
    }
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    return apiKey?.apiKey ?? null;
  },
});

export const deleteApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!apiKey) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(apiKey._id);
  },
});

export const createUserApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    const apiKey = crypto.randomUUID();
    await ctx.db.insert("apiKeys", {
      userId: user._id,
      apiKey,
    });

    return apiKey;
  },
});

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  return user._id;
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

export const upsertFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upsertFromClerk without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user !== null) {
      // User already exists, no need to update anything since we only store clerkId
      return user._id;
    }

    // Create new user with just the clerkId
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email,
    });

    return userId;
  },
});
