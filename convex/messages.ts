import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    applicationId: v.id("applications"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const messageId = await ctx.db.insert("messages", {
      applicationId: args.applicationId,
      senderId: currentUser._id,
      content: args.content,
      isRead: false,
      createdAt: Date.now(),
    });

    // Determine recipient (if sender is applicant, notify staff; if staff, notify applicant)
    const animal = await ctx.db.get(application.animalId);
    let recipientId = application.applicantId;
    if (currentUser._id === application.applicantId && animal) {
      // Notify shelter staff
      const staffAssignments = await ctx.db
        .query("staffAssignments")
        .withIndex("by_shelterId", (q) => q.eq("shelterId", animal.shelterId))
        .collect();
      for (const assignment of staffAssignments) {
        if (assignment.isActive) {
          await ctx.db.insert("notifications", {
            userId: assignment.userId,
            type: "NewMessage",
            title: "New Message",
            message: `${currentUser.name} sent a message about ${animal.name}`,
            link: `/applications/${args.applicationId}`,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    } else {
      // Notify applicant
      await ctx.db.insert("notifications", {
        userId: recipientId,
        type: "NewMessage",
        title: "New Message",
        message: `You received a new message regarding your application`,
        link: `/applications/${args.applicationId}`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return messageId;
  },
});

export const listByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .order("asc")
      .collect();

    const result = [];
    for (const msg of messages) {
      const sender = await ctx.db.get(msg.senderId);
      result.push({ ...msg, sender });
    }
    return result;
  },
});

export const markRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.messageId, { isRead: true });
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

    // Get all applications where user is the applicant
    const userApps = await ctx.db
      .query("applications")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", currentUser._id))
      .collect();

    let unreadCount = 0;
    for (const app of userApps) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_applicationId", (q) => q.eq("applicationId", app._id))
        .collect();
      unreadCount += messages.filter((m) => !m.isRead && m.senderId !== currentUser._id).length;
    }

    // If staff, also count messages on applications for their shelter's animals
    if (currentUser.role === "ShelterStaff" || currentUser.role === "Admin") {
      const assignments = await ctx.db
        .query("staffAssignments")
        .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
        .collect();
      for (const assignment of assignments) {
        if (!assignment.isActive) continue;
        const animals = await ctx.db
          .query("animals")
          .withIndex("by_shelterId", (q) => q.eq("shelterId", assignment.shelterId))
          .collect();
        for (const animal of animals) {
          const apps = await ctx.db
            .query("applications")
            .withIndex("by_animalId", (q) => q.eq("animalId", animal._id))
            .collect();
          for (const app of apps) {
            const messages = await ctx.db
              .query("messages")
              .withIndex("by_applicationId", (q) => q.eq("applicationId", app._id))
              .collect();
            unreadCount += messages.filter((m) => !m.isRead && m.senderId !== currentUser._id).length;
          }
        }
      }
    }

    return unreadCount;
  },
});
