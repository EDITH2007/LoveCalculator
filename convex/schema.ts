import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  loveMatches: defineTable({
    yourName: v.string(),
    crushName: v.string(),
    percentage: v.number(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});