import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    operatingHours: v.string(),
    capacity: v.number(),
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

    const shelterId = await ctx.db.insert("shelters", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Create",
      entityType: "shelters",
      entityId: shelterId,
      details: `Created shelter: ${args.name}`,
      createdAt: Date.now(),
    });

    return shelterId;
  },
});

export const getById = query({
  args: { shelterId: v.id("shelters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shelterId);
  },
});

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const shelters = await ctx.db
      .query("shelters")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      return shelters.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.city.toLowerCase().includes(searchLower) ||
          s.state.toLowerCase().includes(searchLower)
      );
    }

    return shelters;
  },
});

export const update = mutation({
  args: {
    shelterId: v.id("shelters"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    operatingHours: v.optional(v.string()),
    capacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const shelter = await ctx.db.get(args.shelterId);
    if (!shelter) throw new Error("Shelter not found");

    if (currentUser.role === "ShelterStaff") {
      const assignment = await ctx.db
        .query("staffAssignments")
        .withIndex("by_userId_shelterId", (q) =>
          q.eq("userId", currentUser._id).eq("shelterId", args.shelterId)
        )
        .first();
      if (!assignment || !assignment.isActive) {
        throw new Error("Forbidden: Not assigned to this shelter");
      }
    } else if (currentUser.role !== "Admin") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    const { shelterId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.shelterId, updates);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Update",
      entityType: "shelters",
      entityId: args.shelterId,
      details: `Updated shelter fields: ${Object.keys(updates).join(", ")}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { shelterId: v.id("shelters") },
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

    const shelter = await ctx.db.get(args.shelterId);
    if (!shelter) throw new Error("Shelter not found");

    // Check for active animals
    const activeAnimals = await ctx.db
      .query("animals")
      .withIndex("by_shelterId_status", (q) =>
        q.eq("shelterId", args.shelterId).eq("status", "Available")
      )
      .collect();
    if (activeAnimals.length > 0) {
      throw new Error("Cannot delete shelter with active animals. Transfer or remove all animals first.");
    }

    // Cascade: deactivate staff assignments
    const assignments = await ctx.db
      .query("staffAssignments")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();
    for (const assignment of assignments) {
      await ctx.db.patch(assignment._id, { isActive: false });
    }

    await ctx.db.delete(args.shelterId);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Delete",
      entityType: "shelters",
      entityId: args.shelterId,
      details: `Deleted shelter: ${shelter.name}`,
      createdAt: Date.now(),
    });
  },
});
