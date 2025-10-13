import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Get the current authenticated user from the database
 * Throws an error if not authenticated or user not found
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<{
  _id: Id<"users">;
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}> {
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
 * Get the current user's ID
 * Throws an error if not authenticated or user not found
 */
export async function getCurrentUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const user = await getCurrentUser(ctx);
  return user._id;
}

/**
 * Check if user is authenticated and return their identity, or null if not
 */
export async function getCurrentUserOptional(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}
