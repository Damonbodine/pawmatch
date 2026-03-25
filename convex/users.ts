import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("Admin"), v.literal("ShelterStaff"), v.literal("Adopter"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      role: args.role ?? "Adopter",
      isActive: true,
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const createFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "User",
      email: identity.email ?? "",
      role: "Adopter",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db.get(args.userId);
  },
});

export const list = query({
  args: {
    role: v.optional(v.union(v.literal("Admin"), v.literal("ShelterStaff"), v.literal("Adopter"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser || currentUser.role !== "Admin") {
      return [];
    }

    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    }

    return await ctx.db.query("users").order("desc").collect();
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.union(v.literal("Admin"), v.literal("ShelterStaff"), v.literal("Adopter"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    if (currentUser._id !== args.userId && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Can only update own profile");
    }

    const { userId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.userId, updates);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Update",
      entityType: "users",
      entityId: args.userId,
      details: `Updated user fields: ${Object.keys(updates).join(", ")}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser || currentUser.role !== "Admin") {
      throw new Error("Forbidden: Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    await ctx.db.patch(args.userId, { isActive: false, updatedAt: Date.now() });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Delete",
      entityType: "users",
      entityId: args.userId,
      details: "User deactivated",
      createdAt: Date.now(),
    });
  },
});
