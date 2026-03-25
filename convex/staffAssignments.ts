import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    shelterId: v.id("shelters"),
    role: v.union(v.literal("Manager"), v.literal("Caretaker"), v.literal("Volunteer")),
  },
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

    // Check for duplicate assignment
    const existing = await ctx.db
      .query("staffAssignments")
      .withIndex("by_userId_shelterId", (q) =>
        q.eq("userId", args.userId).eq("shelterId", args.shelterId)
      )
      .first();
    if (existing && existing.isActive) {
      throw new Error("This staff member is already assigned to this shelter.");
    }

    // Verify target user and shelter exist
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");
    const shelter = await ctx.db.get(args.shelterId);
    if (!shelter) throw new Error("Shelter not found");

    const assignmentId = await ctx.db.insert("staffAssignments", {
      userId: args.userId,
      shelterId: args.shelterId,
      role: args.role,
      isActive: true,
      assignedAt: Date.now(),
      createdAt: Date.now(),
    });

    // Update user role to ShelterStaff if they're an Adopter
    if (targetUser.role === "Adopter") {
      await ctx.db.patch(args.userId, { role: "ShelterStaff", updatedAt: Date.now() });
    }

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Assignment",
      entityType: "staffAssignments",
      entityId: assignmentId,
      details: `Assigned ${targetUser.name} to ${shelter.name} as ${args.role}`,
      createdAt: Date.now(),
    });

    return assignmentId;
  },
});

export const listByShelter = query({
  args: { shelterId: v.id("shelters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const assignments = await ctx.db
      .query("staffAssignments")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();

    const result = [];
    for (const assignment of assignments) {
      const user = await ctx.db.get(assignment.userId);
      result.push({ ...assignment, user });
    }
    return result;
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const assignments = await ctx.db
      .query("staffAssignments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const result = [];
    for (const assignment of assignments) {
      const shelter = await ctx.db.get(assignment.shelterId);
      result.push({ ...assignment, shelter });
    }
    return result;
  },
});

export const remove = mutation({
  args: { assignmentId: v.id("staffAssignments") },
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

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) throw new Error("Staff assignment not found");

    await ctx.db.patch(args.assignmentId, { isActive: false });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Delete",
      entityType: "staffAssignments",
      entityId: args.assignmentId,
      details: "Staff assignment deactivated",
      createdAt: Date.now(),
    });
  },
});
