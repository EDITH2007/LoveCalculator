import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    yourName: v.string(),
    crushName: v.string(),
    percentage: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("loveMatches", {
      yourName: args.yourName,
      crushName: args.crushName,
      percentage: args.percentage,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("loveMatches")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100);
  },
});