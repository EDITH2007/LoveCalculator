import { v } from "convex/values";
import { mutation, internalQuery } from "./_generated/server";

export const submit = mutation({
  args: {
    yourName: v.string(),
    crushName: v.string(),
    percentage: v.number(),
    email: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    platform: v.optional(v.string()),
    language: v.optional(v.string()),
    screenSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Normalize names to detect special-case pairs (with or without surname)
    const normalize = (s: string) => s.trim().toLowerCase();
    const your = normalize(args.yourName);
    const crush = normalize(args.crushName);
    const hasNikhil = your.includes("nikhil") || crush.includes("nikhil");
    const hasSuhani = your.includes("suhani") || crush.includes("suhani");

    // If the pair contains both Nikhil and Suhani (in either order, with or without surnames),
    // enforce percentage 98 and persist that to the DB.
    const percentageToSave = hasNikhil && hasSuhani ? 98 : args.percentage;

    await ctx.db.insert("loveMatches", {
      yourName: args.yourName,
      crushName: args.crushName,
      percentage: percentageToSave,
      email: args.email,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      platform: args.platform,
      language: args.language,
      screenSize: args.screenSize,
      createdAt: Date.now(),
    });
  },
});

export const list = internalQuery({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("loveMatches")
      .withIndex("by_createdAt", (q) => q)
      .order("desc")
      .take(100);

    // Normalize a string for matching
    const norm = (s: string) => s.trim().toLowerCase();

    // If a search is provided and contains both names, reveal percentages for matching rows.
    if (args.search) {
      const s = norm(args.search);
      const containsNikhil = s.includes("nikhil");
      const containsSuhani = s.includes("suhani");

      if (containsNikhil && containsSuhani) {
        // Return rows that match both names (either order) and include percentage.
        return rows.filter((r) => {
          const a = norm(r.yourName);
          const b = norm(r.crushName);
          return (a.includes("nikhil") || b.includes("nikhil")) && (a.includes("suhani") || b.includes("suhani"));
        });
      }
    }

    // Default listing: hide percentages from other users for privacy.
    return rows.map((r) => {
      const { percentage, ...rest } = r;
      return rest as Omit<typeof r, "percentage">;
    });
  },
});