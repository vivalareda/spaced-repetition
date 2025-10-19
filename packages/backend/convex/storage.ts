import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUserId } from "./users";

export const getImageUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await getCurrentUserId(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});
