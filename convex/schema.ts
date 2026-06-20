import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  loveMatches: defineTable({
    yourName: v.string(),
    crushName: v.string(),
    percentage: v.number(),
    email: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    platform: v.optional(v.string()),
    language: v.optional(v.string()),
    screenSize: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});