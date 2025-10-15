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

/**
 * Helper function to get current user with error handling
 * Throws error if not authenticated or user not found
 */
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

/**
 * Helper function to get current user ID
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  return user._id;
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
