import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("Admin"), v.literal("ShelterStaff"), v.literal("Adopter")),
    bio: v.optional(v.string()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  shelters: defineTable({
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
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isActive", ["isActive"]),

  staffAssignments: defineTable({
    userId: v.id("users"),
    shelterId: v.id("shelters"),
    role: v.union(v.literal("Manager"), v.literal("Caretaker"), v.literal("Volunteer")),
    isActive: v.boolean(),
    assignedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_shelterId", ["shelterId"])
    .index("by_userId_shelterId", ["userId", "shelterId"]),

  animals: defineTable({
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
    status: v.union(v.literal("Available"), v.literal("Pending"), v.literal("Adopted"), v.literal("OnHold")),
    shelterId: v.id("shelters"),
    intakeDate: v.number(),
    adoptedDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_shelterId", ["shelterId"])
    .index("by_status", ["status"])
    .index("by_species", ["species"])
    .index("by_shelterId_status", ["shelterId", "status"]),

  applications: defineTable({
    animalId: v.id("animals"),
    applicantId: v.id("users"),
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
    status: v.union(v.literal("Submitted"), v.literal("UnderReview"), v.literal("Approved"), v.literal("Rejected"), v.literal("Withdrawn")),
    reviewNotes: v.optional(v.string()),
    reviewedById: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_animalId", ["animalId"])
    .index("by_applicantId", ["applicantId"])
    .index("by_status", ["status"])
    .index("by_animalId_applicantId", ["animalId", "applicantId"]),

  favoriteAnimals: defineTable({
    userId: v.id("users"),
    animalId: v.id("animals"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_animalId", ["animalId"])
    .index("by_userId_animalId", ["userId", "animalId"]),

  animalMedicalRecords: defineTable({
    animalId: v.id("animals"),
    type: v.union(v.literal("Vaccination"), v.literal("Treatment"), v.literal("Checkup"), v.literal("Surgery"), v.literal("Medication")),
    description: v.string(),
    veterinarian: v.optional(v.string()),
    date: v.number(),
    nextDueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    recordedById: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_animalId", ["animalId"]),

  messages: defineTable({
    applicationId: v.id("applications"),
    senderId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_applicationId", ["applicationId"])
    .index("by_senderId", ["senderId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("ApplicationSubmitted"), v.literal("ApplicationStatusChanged"), v.literal("NewMessage"), v.literal("AnimalStatusChanged"), v.literal("SystemAlert")),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.union(v.literal("Create"), v.literal("Update"), v.literal("Delete"), v.literal("StatusChange"), v.literal("Login"), v.literal("Assignment")),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType", ["entityType"]),

  userSettings: defineTable({
    userId: v.id("users"),
    emailNotifications: v.boolean(),
    applicationUpdates: v.boolean(),
    newAnimalAlerts: v.boolean(),
    preferredSpecies: v.optional(v.array(v.string())),
    preferredSize: v.optional(v.array(v.string())),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),
});
