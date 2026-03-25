import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggle = mutation({
  args: { animalId: v.id("animals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favoriteAnimals")
      .withIndex("by_userId_animalId", (q) =>
        q.eq("userId", currentUser._id).eq("animalId", args.animalId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favoriteAnimals", {
      userId: currentUser._id,
      animalId: args.animalId,
      createdAt: Date.now(),
    });
    return { favorited: true };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return [];

    const favorites = await ctx.db
      .query("favoriteAnimals")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    const result = [];
    for (const fav of favorites) {
      const animal = await ctx.db.get(fav.animalId);
      if (animal) {
        result.push({ ...fav, animal });
      }
    }
    return result;
  },
});

export const checkFavorite = query({
  args: { animalId: v.id("animals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return false;

    const existing = await ctx.db
      .query("favoriteAnimals")
      .withIndex("by_userId_animalId", (q) =>
        q.eq("userId", currentUser._id).eq("animalId", args.animalId)
      )
      .first();

    return !!existing;
  },
});
