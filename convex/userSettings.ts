import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();
  },
});

export const upsert = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    applicationUpdates: v.optional(v.boolean()),
    newAnimalAlerts: v.optional(v.boolean()),
    preferredSpecies: v.optional(v.array(v.string())),
    preferredSize: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(args)) {
      if (val !== undefined) updates[key] = val;
    }
    updates.updatedAt = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    return await ctx.db.insert("userSettings", {
      userId: currentUser._id,
      emailNotifications: args.emailNotifications ?? true,
      applicationUpdates: args.applicationUpdates ?? true,
      newAnimalAlerts: args.newAnimalAlerts ?? true,
      preferredSpecies: args.preferredSpecies,
      preferredSize: args.preferredSize,
      updatedAt: Date.now(),
    });
  },
});
