import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    animalId: v.id("animals"),
    applicantName: v.string(),
    applicantEmail: v.string(),
    applicantPhone: v.string(),
    housingType: v.union(v.literal("House"), v.literal("Apartment"), v.literal("Condo"), v.literal("Townhouse"), v.literal("Other")),
    hasYard: v.boolean(),
    yardFenced: v.optional(v.boolean()),
    otherPets: v.optional(v.string()),
    householdMembers: v.optional(v.number()),
    hasChildren: v.optional(v.boolean()),
    childrenAges: v.optional(v.string()),
    experienceLevel: v.union(v.literal("FirstTime"), v.literal("SomeExperience"), v.literal("Experienced")),
    personalStatement: v.string(),
    veterinarianName: v.optional(v.string()),
    veterinarianPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("Not authenticated");

    // Check animal exists and is available
    const animal = await ctx.db.get(args.animalId);
    if (!animal) throw new Error("Animal not found");
    if (animal.status !== "Available" && animal.status !== "Pending") {
      throw new Error("This animal is not currently available for adoption.");
    }

    // Check for duplicate application
    const existingApps = await ctx.db
      .query("applications")
      .withIndex("by_animalId_applicantId", (q) =>
        q.eq("animalId", args.animalId).eq("applicantId", currentUser._id)
      )
      .collect();
    const activeApp = existingApps.find(
      (a) => a.status === "Submitted" || a.status === "UnderReview"
    );
    if (activeApp) {
      throw new Error("You already have an active application for this animal.");
    }

    const applicationId = await ctx.db.insert("applications", {
      ...args,
      applicantId: currentUser._id,
      status: "Submitted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Set animal to Pending if it was Available
    if (animal.status === "Available") {
      await ctx.db.patch(args.animalId, { status: "Pending", updatedAt: Date.now() });
    }

    // Notify shelter staff
    const staffAssignments = await ctx.db
      .query("staffAssignments")
      .withIndex("by_shelterId", (q) => q.eq("shelterId", animal.shelterId))
      .collect();
    for (const assignment of staffAssignments) {
      if (assignment.isActive) {
        await ctx.db.insert("notifications", {
          userId: assignment.userId,
          type: "ApplicationSubmitted",
          title: "New Adoption Application",
          message: `${currentUser.name} submitted an application for ${animal.name}`,
          link: `/applications/${applicationId}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "Create",
      entityType: "applications",
      entityId: applicationId,
      details: `Application submitted for ${animal.name}`,
      createdAt: Date.now(),
    });

    return applicationId;
  },
});

export const getById = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    const applicant = await ctx.db.get(application.applicantId);
    const animal = await ctx.db.get(application.animalId);
    const shelter = animal ? await ctx.db.get(animal.shelterId) : null;

    return { ...application, applicant, animal, shelter };
  },
});

export const listByAnimal = query({
  args: {
    animalId: v.id("animals"),
    status: v.optional(v.union(v.literal("Submitted"), v.literal("UnderReview"), v.literal("Approved"), v.literal("Rejected"), v.literal("Withdrawn"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_animalId", (q) => q.eq("animalId", args.animalId))
      .order("desc")
      .collect();

    const filtered = args.status
      ? applications.filter((a) => a.status === args.status)
      : applications;

    const result = [];
    for (const app of filtered) {
      const applicant = await ctx.db.get(app.applicantId);
      result.push({ ...app, applicant });
    }
    return result;
  },
});

export const listByUser = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("Submitted"), v.literal("UnderReview"), v.literal("Approved"), v.literal("Rejected"), v.literal("Withdrawn"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) return [];

    const targetUserId = args.userId ?? currentUser._id;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_applicantId", (q) => q.eq("applicantId", targetUserId))
      .order("desc")
      .collect();

    const filtered = args.status
      ? applications.filter((a) => a.status === args.status)
      : applications;

    const result = [];
    for (const app of filtered) {
      const animal = await ctx.db.get(app.animalId);
      result.push({ ...app, animal });
    }
    return result;
  },
});

export const listByStatus = query({
  args: {
    status: v.union(v.literal("Submitted"), v.literal("UnderReview"), v.literal("Approved"), v.literal("Rejected"), v.literal("Withdrawn")),
    shelterId: v.optional(v.id("shelters")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    let filtered = applications;
    if (args.shelterId) {
      const shelterAnimals = await ctx.db
        .query("animals")
        .withIndex("by_shelterId", (q) => q.eq("shelterId", args.shelterId!))
        .collect();
      const animalIds = new Set(shelterAnimals.map((a) => a._id));
      filtered = applications.filter((app) => animalIds.has(app.animalId));
    }

    const result = [];
    for (const app of filtered) {
      const applicant = await ctx.db.get(app.applicantId);
      const animal = await ctx.db.get(app.animalId);
      result.push({ ...app, applicant, animal });
    }
    return result;
  },
});

export const approve = mutation({
  args: {
    applicationId: v.id("applications"),
    reviewNotes: v.optional(v.string()),
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

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    if (application.status !== "Submitted" && application.status !== "UnderReview") {
      throw new Error("Invalid status transition. Only Submitted or UnderReview applications can be approved.");
    }

    const animal = await ctx.db.get(application.animalId);
    if (!animal) throw new Error("Animal not found");

    // Approve this application
    await ctx.db.patch(args.applicationId, {
      status: "Approved",
      reviewNotes: args.reviewNotes,
      reviewedById: currentUser._id,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update animal to Adopted
    await ctx.db.patch(application.animalId, {
      status: "Adopted",
      adoptedDate: Date.now(),
      updatedAt: Date.now(),
    });

    // Reject all other pending/underReview applications for this animal
    const otherApps = await ctx.db
      .query("applications")
      .withIndex("by_animalId", (q) => q.eq("animalId", application.animalId))
      .collect();
    for (const otherApp of otherApps) {
      if (otherApp._id !== args.applicationId && (otherApp.status === "Submitted" || otherApp.status === "UnderReview")) {
        await ctx.db.patch(otherApp._id, {
          status: "Rejected",
          reviewNotes: "Another application was approved for this animal.",
          reviewedById: currentUser._id,
          reviewedAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Notify rejected applicants
        await ctx.db.insert("notifications", {
          userId: otherApp.applicantId,
          type: "ApplicationStatusChanged",
          title: "Application Update",
          message: `Your application for ${animal.name} was not selected.`,
          link: `/applications/${otherApp._id}`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    // Notify approved applicant
    await ctx.db.insert("notifications", {
      userId: application.applicantId,
      type: "ApplicationStatusChanged",
      title: "Application Approved!",
      message: `Congratulations! Your application for ${animal.name} has been approved.`,
      link: `/applications/${args.applicationId}`,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "StatusChange",
      entityType: "applications",
      entityId: args.applicationId,
      details: `Application approved for ${animal.name}. Animal marked as Adopted.`,
      createdAt: Date.now(),
    });
  },
});

export const reject = mutation({
  args: {
    applicationId: v.id("applications"),
    rejectionReason: v.string(),
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

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    if (application.status !== "Submitted" && application.status !== "UnderReview") {
      throw new Error("Invalid status transition. Only Submitted or UnderReview applications can be rejected.");
    }

    await ctx.db.patch(args.applicationId, {
      status: "Rejected",
      reviewNotes: args.rejectionReason,
      reviewedById: currentUser._id,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const animal = await ctx.db.get(application.animalId);

    // Check if there are remaining pending apps; if not, set animal back to Available
    const remainingApps = await ctx.db
      .query("applications")
      .withIndex("by_animalId", (q) => q.eq("animalId", application.animalId))
      .collect();
    const stillPending = remainingApps.filter(
      (a) => a._id !== args.applicationId && (a.status === "Submitted" || a.status === "UnderReview")
    );
    if (stillPending.length === 0 && animal && animal.status === "Pending") {
      await ctx.db.patch(application.animalId, { status: "Available", updatedAt: Date.now() });
    }

    // Notify applicant
    await ctx.db.insert("notifications", {
      userId: application.applicantId,
      type: "ApplicationStatusChanged",
      title: "Application Update",
      message: `Your application for ${animal?.name ?? "an animal"} was not approved.`,
      link: `/applications/${args.applicationId}`,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "StatusChange",
      entityType: "applications",
      entityId: args.applicationId,
      details: `Application rejected. Reason: ${args.rejectionReason}`,
      createdAt: Date.now(),
    });
  },
});

export const withdraw = mutation({
  args: { applicationId: v.id("applications") },
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

    if (application.applicantId !== currentUser._id && currentUser.role !== "Admin") {
      throw new Error("Forbidden: Can only withdraw own applications");
    }

    if (application.status !== "Submitted" && application.status !== "UnderReview") {
      throw new Error("Only Submitted or UnderReview applications can be withdrawn.");
    }

    await ctx.db.patch(args.applicationId, {
      status: "Withdrawn",
      updatedAt: Date.now(),
    });

    const animal = await ctx.db.get(application.animalId);

    // Check if there are remaining pending apps
    const remainingApps = await ctx.db
      .query("applications")
      .withIndex("by_animalId", (q) => q.eq("animalId", application.animalId))
      .collect();
    const stillPending = remainingApps.filter(
      (a) => a._id !== args.applicationId && (a.status === "Submitted" || a.status === "UnderReview")
    );
    if (stillPending.length === 0 && animal && animal.status === "Pending") {
      await ctx.db.patch(application.animalId, { status: "Available", updatedAt: Date.now() });
    }

    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      action: "StatusChange",
      entityType: "applications",
      entityId: args.applicationId,
      details: "Application withdrawn",
      createdAt: Date.now(),
    });
  },
});
