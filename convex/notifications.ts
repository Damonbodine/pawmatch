import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("ApplicationSubmitted"), v.literal("ApplicationStatusChanged"), v.literal("NewMessage"), v.literal("AnimalStatusChanged"), v.literal("SystemAlert")),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const listByUser = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return [];

    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_userId_isRead", (q) =>
          q.eq("userId", currentUser._id).eq("isRead", false)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .take(50);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", currentUser._id).eq("isRead", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) =>
        q.eq("userId", currentUser._id).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});
