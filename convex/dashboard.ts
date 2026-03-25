import { query } from "./_generated/server";
import { v } from "convex/values";

export const adminStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser || currentUser.role !== "Admin") {
      return null;
    }

    const allAnimals = await ctx.db.query("animals").collect();
    const allApplications = await ctx.db.query("applications").collect();
    const allShelters = await ctx.db.query("shelters").collect();
    const allUsers = await ctx.db.query("users").collect();

    return {
      totalAnimals: allAnimals.length,
      animalsByStatus: {
        available: allAnimals.filter((a) => a.status === "Available").length,
        pending: allAnimals.filter((a) => a.status === "Pending").length,
        adopted: allAnimals.filter((a) => a.status === "Adopted").length,
        onHold: allAnimals.filter((a) => a.status === "OnHold").length,
      },
      animalsBySpecies: {
        dog: allAnimals.filter((a) => a.species === "Dog").length,
        cat: allAnimals.filter((a) => a.species === "Cat").length,
        rabbit: allAnimals.filter((a) => a.species === "Rabbit").length,
        bird: allAnimals.filter((a) => a.species === "Bird").length,
        other: allAnimals.filter((a) => a.species === "Other").length,
      },
      totalApplications: allApplications.length,
      applicationsByStatus: {
        submitted: allApplications.filter((a) => a.status === "Submitted").length,
        underReview: allApplications.filter((a) => a.status === "UnderReview").length,
        approved: allApplications.filter((a) => a.status === "Approved").length,
        rejected: allApplications.filter((a) => a.status === "Rejected").length,
        withdrawn: allApplications.filter((a) => a.status === "Withdrawn").length,
      },
      totalShelters: allShelters.length,
      activeShelters: allShelters.filter((s) => s.isActive).length,
      totalUsers: allUsers.length,
      usersByRole: {
        admin: allUsers.filter((u) => u.role === "Admin").length,
        shelterStaff: allUsers.filter((u) => u.role === "ShelterStaff").length,
        adopter: allUsers.filter((u) => u.role === "Adopter").length,
      },
    };
  },
});

export const shelterStats = query({
  args: { shelterId: v.id("shelters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const shelter = await ctx.db.get(args.shelterId);
    if (!shelter) throw new Error("Shelter not found");

    const animals = await ctx.db
      .query("animals")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();

    const animalIds = animals.map((a) => a._id);
    const allApplications = [];
    for (const animalId of animalIds) {
      const apps = await ctx.db
        .query("applications")
        .withIndex("by_animalId", (q) => q.eq("animalId", animalId))
        .collect();
      allApplications.push(...apps);
    }

    const staff = await ctx.db
      .query("staffAssignments")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId))
      .collect();

    return {
      shelterName: shelter.name,
      capacity: shelter.capacity,
      totalAnimals: animals.length,
      nonAdoptedAnimals: animals.filter((a) => a.status !== "Adopted").length,
      animalsByStatus: {
        available: animals.filter((a) => a.status === "Available").length,
        pending: animals.filter((a) => a.status === "Pending").length,
        adopted: animals.filter((a) => a.status === "Adopted").length,
        onHold: animals.filter((a) => a.status === "OnHold").length,
      },
      totalApplications: allApplications.length,
      pendingApplications: allApplications.filter(
        (a) => a.status === "Submitted" || a.status === "UnderReview"
      ).length,
      activeStaff: staff.filter((s) => s.isActive).length,
    };
  },
});

export const adopterStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return null;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", currentUser._id))
      .collect();

    const favorites = await ctx.db
      .query("favoriteAnimals")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    return {
      totalApplications: applications.length,
      applicationsByStatus: {
        submitted: applications.filter((a) => a.status === "Submitted").length,
        underReview: applications.filter((a) => a.status === "UnderReview").length,
        approved: applications.filter((a) => a.status === "Approved").length,
        rejected: applications.filter((a) => a.status === "Rejected").length,
        withdrawn: applications.filter((a) => a.status === "Withdrawn").length,
      },
      totalFavorites: favorites.length,
    };
  },
});
