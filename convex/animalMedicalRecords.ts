import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    animalId: v.id("animals"),
    type: v.union(v.literal("Vaccination"), v.literal("Treatment"), v.literal("Checkup"), v.literal("Surgery"), v.literal("Medication")),
    description: v.string(),
    veterinarian: v.optional(v.string()),
    date: v.number(),
    nextDueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");
    if (currentUser.role !== "Admin" && currentUser.role !== "ShelterStaff") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    const animal = await ctx.db.get(args.animalId);
    if (!animal) throw new Error("Animal not found");

    const recordId = await ctx.db.insert("animalMedicalRecords", {
      ...args,
      recordedById: currentUser._id,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Create",
      entityType: "animalMedicalRecords",
      entityId: recordId,
      details: `Added ${args.type} record for ${animal.name}`,
      createdAt: Date.now(),
    });

    return recordId;
  },
});

export const listByAnimal = query({
  args: { animalId: v.id("animals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("animalMedicalRecords")
      .withIndex("by_animalId", (q) => q.eq("animalId", args.animalId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    recordId: v.id("animalMedicalRecords"),
    description: v.optional(v.string()),
    veterinarian: v.optional(v.string()),
    notes: v.optional(v.string()),
    nextDueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");
    if (currentUser.role !== "Admin" && currentUser.role !== "ShelterStaff") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    const record = await ctx.db.get(args.recordId);
    if (!record) throw new Error("Medical record not found");

    const { recordId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }

    await ctx.db.patch(args.recordId, updates);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Update",
      entityType: "animalMedicalRecords",
      entityId: args.recordId,
      details: `Updated medical record fields: ${Object.keys(updates).join(", ")}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { recordId: v.id("animalMedicalRecords") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");
    if (currentUser.role !== "Admin" && currentUser.role !== "ShelterStaff") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    const record = await ctx.db.get(args.recordId);
    if (!record) throw new Error("Medical record not found");

    await ctx.db.delete(args.recordId);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Delete",
      entityType: "animalMedicalRecords",
      entityId: args.recordId,
      details: "Medical record deleted",
      createdAt: Date.now(),
    });
  },
});
