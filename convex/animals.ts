import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    shelterId: v.id("shelters"),
    name: v.string(),
    species: v.union(v.literal("Dog"), v.literal("Cat"), v.literal("Rabbit"), v.literal("Bird"), v.literal("Other")),
    breed: v.string(),
    age: v.union(v.literal("Puppy/Kitten"), v.literal("Young"), v.literal("Adult"), v.literal("Senior")),
    gender: v.union(v.literal("Male"), v.literal("Female")),
    size: v.union(v.literal("Small"), v.literal("Medium"), v.literal("Large")),
    weight: v.optional(v.number()),
    color: v.optional(v.string()),
    description: v.string(),
    photoUrl: v.optional(v.string()),
    additionalPhotos: v.optional(v.array(v.string())),
    medicalStatus: v.union(v.literal("Healthy"), v.literal("NeedsTreatment"), v.literal("SpecialNeeds")),
    isSpayedNeutered: v.boolean(),
    isVaccinated: v.boolean(),
    isMicrochipped: v.optional(v.boolean()),
    temperament: v.optional(v.string()),
    goodWithKids: v.optional(v.boolean()),
    goodWithDogs: v.optional(v.boolean()),
    goodWithCats: v.optional(v.boolean()),
    specialNeeds: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    // Auth: admin or assigned staff
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

    // Capacity check
    const shelter = await ctx.db.get(args.shelterId);
    if (!shelter) throw new Error("Shelter not found");

    const currentAnimals = await ctx.db
      .query("animals")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();
    const nonAdoptedCount = currentAnimals.filter((a) => a.status !== "Adopted").length;
    if (nonAdoptedCount >= shelter.capacity) {
      throw new Error("This shelter has reached its maximum animal capacity.");
    }

    const animalId = await ctx.db.insert("animals", {
      ...args,
      status: "Available",
      intakeDate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Create",
      entityType: "animals",
      entityId: animalId,
      details: `Added animal: ${args.name} (${args.species})`,
      createdAt: Date.now(),
    });

    return animalId;
  },
});

export const getById = query({
  args: { animalId: v.id("animals") },
  handler: async (ctx, args) => {
    const animal = await ctx.db.get(args.animalId);
    if (!animal) return null;

    const shelter = await ctx.db.get(animal.shelterId);
    return { ...animal, shelter };
  },
});

export const list = query({
  args: {
    species: v.optional(v.union(v.literal("Dog"), v.literal("Cat"), v.literal("Rabbit"), v.literal("Bird"), v.literal("Other"))),
    status: v.optional(v.union(v.literal("Available"), v.literal("Pending"), v.literal("Adopted"), v.literal("OnHold"))),
    shelterId: v.optional(v.id("shelters")),
    size: v.optional(v.union(v.literal("Small"), v.literal("Medium"), v.literal("Large"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let animals;

    if (args.shelterId && args.status) {
      animals = await ctx.db
        .query("animals")
        .withIndex("by_shelterId_status", (q) =>
          q.eq("shelterId", args.shelterId!).eq("status", args.status!)
        )
        .collect();
    } else if (args.shelterId) {
      animals = await ctx.db
        .query("animals")
        .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId!))
        .collect();
    } else if (args.status) {
      animals = await ctx.db
        .query("animals")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.species) {
      animals = await ctx.db
        .query("animals")
        .withIndex("by_species", (q) => q.eq("species", args.species!))
        .collect();
    } else {
      animals = await ctx.db.query("animals").order("desc").collect();
    }

    // Apply additional client-side filters
    if (args.species && !(!args.shelterId && !args.status)) {
      animals = animals.filter((a) => a.species === args.species);
    }
    if (args.size) {
      animals = animals.filter((a) => a.size === args.size);
    }
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      animals = animals.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.breed.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      );
    }

    return animals;
  },
});

export const listByShelter = query({
  args: {
    shelterId: v.id("shelters"),
    status: v.optional(v.union(v.literal("Available"), v.literal("Pending"), v.literal("Adopted"), v.literal("OnHold"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("animals")
        .withIndex("by_shelterId_status", (q) =>
          q.eq("shelterId", args.shelterId).eq("status", args.status!)
        )
        .collect();
    }
    return await ctx.db
      .query("animals")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();
  },
});

export const update = mutation({
  args: {
    animalId: v.id("animals"),
    name: v.optional(v.string()),
    breed: v.optional(v.string()),
    age: v.optional(v.union(v.literal("Puppy/Kitten"), v.literal("Young"), v.literal("Adult"), v.literal("Senior"))),
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"))),
    size: v.optional(v.union(v.literal("Small"), v.literal("Medium"), v.literal("Large"))),
    weight: v.optional(v.number()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    additionalPhotos: v.optional(v.array(v.string())),
    medicalStatus: v.optional(v.union(v.literal("Healthy"), v.literal("NeedsTreatment"), v.literal("SpecialNeeds"))),
    isSpayedNeutered: v.optional(v.boolean()),
    isVaccinated: v.optional(v.boolean()),
    isMicrochipped: v.optional(v.boolean()),
    temperament: v.optional(v.string()),
    goodWithKids: v.optional(v.boolean()),
    goodWithDogs: v.optional(v.boolean()),
    goodWithCats: v.optional(v.boolean()),
    specialNeeds: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
    status: v.optional(v.union(v.literal("Available"), v.literal("Pending"), v.literal("Adopted"), v.literal("OnHold"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const animal = await ctx.db.get(args.animalId);
    if (!animal) throw new Error("Animal not found");

    // Auth: admin or assigned staff
    if (currentUser.role === "ShelterStaff") {
      const assignment = await ctx.db
        .query("staffAssignments")
        .withIndex("by_userId_shelterId", (q) =>
          q.eq("userId", currentUser._id).eq("shelterId", animal.shelterId)
        )
        .first();
      if (!assignment || !assignment.isActive) {
        throw new Error("Forbidden: Not assigned to this shelter");
      }
    } else if (currentUser.role !== "Admin") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    const { animalId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    updates.updatedAt = Date.now();

    await ctx.db.patch(args.animalId, updates);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Update",
      entityType: "animals",
      entityId: args.animalId,
      details: `Updated animal fields: ${Object.keys(updates).join(", ")}`,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { animalId: v.id("animals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    const animal = await ctx.db.get(args.animalId);
    if (!animal) throw new Error("Animal not found");

    // Check for active applications
    const activeApps = await ctx.db
      .query("applications")
      .withIndex("by_animalId", (q) => q.eq("animalId", args.animalId))
      .collect();
    const pendingApps = activeApps.filter(
      (a) => a.status === "Submitted" || a.status === "UnderReview"
    );
    if (pendingApps.length > 0) {
      throw new Error("Cannot delete animal with active applications. Reject or withdraw all applications first.");
    }

    // Auth: admin or assigned staff
    if (currentUser.role === "ShelterStaff") {
      const assignment = await ctx.db
        .query("staffAssignments")
        .withIndex("by_userId_shelterId", (q) =>
          q.eq("userId", currentUser._id).eq("shelterId", animal.shelterId)
        )
        .first();
      if (!assignment || !assignment.isActive) {
        throw new Error("Forbidden: Not assigned to this shelter");
      }
    } else if (currentUser.role !== "Admin") {
      throw new Error("Forbidden: Admin or staff access required");
    }

    await ctx.db.delete(args.animalId);

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Delete",
      entityType: "animals",
      entityId: args.animalId,
      details: `Deleted animal: ${animal.name}`,
      createdAt: Date.now(),
    });
  },
});
