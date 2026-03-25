import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ── Users ──
    const adminUser = await ctx.db.insert("users", {
      clerkId: "clerk_admin_001",
      name: "Sarah Admin",
      email: "sarah@pawmatch.com",
      phone: "512-555-0001",
      role: "Admin",
      bio: "Platform administrator",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const staffUser1 = await ctx.db.insert("users", {
      clerkId: "clerk_staff_001",
      name: "Mike Handler",
      email: "mike@happytails.org",
      phone: "512-555-0002",
      role: "ShelterStaff",
      bio: "Animal care specialist with 10 years experience",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const staffUser2 = await ctx.db.insert("users", {
      clerkId: "clerk_staff_002",
      name: "Lisa Caretaker",
      email: "lisa@petsafe.org",
      phone: "512-555-0003",
      role: "ShelterStaff",
      bio: "Veterinary technician and volunteer coordinator",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const adopter1 = await ctx.db.insert("users", {
      clerkId: "clerk_adopter_001",
      name: "Emily Johnson",
      email: "emily@example.com",
      phone: "512-555-0004",
      role: "Adopter",
      bio: "Dog lover looking for a companion",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const adopter2 = await ctx.db.insert("users", {
      clerkId: "clerk_adopter_002",
      name: "James Wilson",
      email: "james@example.com",
      phone: "512-555-0005",
      role: "Adopter",
      bio: "Family of four looking for a family pet",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // ── Shelters ──
    const shelter1 = await ctx.db.insert("shelters", {
      name: "Happy Tails Rescue",
      address: "123 Bark Street",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      phone: "512-555-1001",
      email: "info@happytails.org",
      website: "https://happytails.org",
      description: "A no-kill shelter dedicated to finding forever homes for dogs and cats in Central Texas.",
      operatingHours: "Mon-Sat 10AM-6PM, Sun 12PM-5PM",
      capacity: 50,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const shelter2 = await ctx.db.insert("shelters", {
      name: "PetSafe Haven",
      address: "456 Whisker Lane",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      phone: "512-555-1002",
      email: "info@petsafe.org",
      website: "https://petsafe.org",
      description: "Specializing in small animals and birds. Open adoption events every weekend.",
      operatingHours: "Tue-Sun 9AM-5PM",
      capacity: 30,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const shelter3 = await ctx.db.insert("shelters", {
      name: "Second Chance Shelter",
      address: "789 Paw Avenue",
      city: "Round Rock",
      state: "TX",
      zipCode: "78664",
      phone: "512-555-1003",
      email: "hello@secondchance.org",
      description: "Giving animals a second chance at a loving home.",
      operatingHours: "Mon-Fri 8AM-4PM",
      capacity: 40,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // ── Staff Assignments ──
    await ctx.db.insert("staffAssignments", {
      userId: staffUser1,
      shelterId: shelter1,
      role: "Manager",
      isActive: true,
      assignedAt: now,
      createdAt: now,
    });

    await ctx.db.insert("staffAssignments", {
      userId: staffUser2,
      shelterId: shelter2,
      role: "Caretaker",
      isActive: true,
      assignedAt: now,
      createdAt: now,
    });

    // ── Animals ──
    const buddy = await ctx.db.insert("animals", {
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: "Adult",
      gender: "Male",
      size: "Large",
      weight: 65,
      color: "Golden",
      description: "Friendly and energetic golden retriever who loves playing fetch and swimming. Great with kids and other dogs.",
      medicalStatus: "Healthy",
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: true,
      temperament: "Friendly, playful, gentle",
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      adoptionFee: 250,
      status: "Available",
      shelterId: shelter1,
      intakeDate: now - 86400000 * 30,
      createdAt: now,
      updatedAt: now,
    });

    const luna = await ctx.db.insert("animals", {
      name: "Luna",
      species: "Cat",
      breed: "Domestic Shorthair",
      age: "Young",
      gender: "Female",
      size: "Small",
      weight: 8,
      color: "Black and white",
      description: "Sweet and curious cat who loves window perches and lap time. Very gentle.",
      medicalStatus: "Healthy",
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: false,
      temperament: "Curious, affectionate, calm",
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: true,
      adoptionFee: 150,
      status: "Available",
      shelterId: shelter1,
      intakeDate: now - 86400000 * 20,
      createdAt: now,
      updatedAt: now,
    });

    const max = await ctx.db.insert("animals", {
      name: "Max",
      species: "Dog",
      breed: "Labrador Mix",
      age: "Puppy/Kitten",
      gender: "Male",
      size: "Medium",
      weight: 25,
      color: "Chocolate",
      description: "Energetic puppy looking for an active family. Currently in training classes.",
      medicalStatus: "Healthy",
      isSpayedNeutered: false,
      isVaccinated: true,
      isMicrochipped: false,
      temperament: "Energetic, playful, eager to learn",
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      adoptionFee: 300,
      status: "Available",
      shelterId: shelter2,
      intakeDate: now - 86400000 * 10,
      createdAt: now,
      updatedAt: now,
    });

    const whiskers = await ctx.db.insert("animals", {
      name: "Whiskers",
      species: "Rabbit",
      breed: "Holland Lop",
      age: "Adult",
      gender: "Female",
      size: "Small",
      weight: 4,
      color: "White and brown",
      description: "Gentle rabbit who enjoys being held and exploring. Litter trained.",
      medicalStatus: "Healthy",
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: false,
      temperament: "Gentle, curious",
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: false,
      adoptionFee: 75,
      status: "Available",
      shelterId: shelter2,
      intakeDate: now - 86400000 * 15,
      createdAt: now,
      updatedAt: now,
    });

    const charlie = await ctx.db.insert("animals", {
      name: "Charlie",
      species: "Dog",
      breed: "Beagle",
      age: "Senior",
      gender: "Male",
      size: "Medium",
      weight: 30,
      color: "Tricolor",
      description: "Calm senior beagle looking for a quiet home. Loves belly rubs and naps.",
      medicalStatus: "SpecialNeeds",
      isSpayedNeutered: true,
      isVaccinated: true,
      isMicrochipped: true,
      temperament: "Calm, gentle, loyal",
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: true,
      specialNeeds: "Requires daily joint supplement medication",
      adoptionFee: 100,
      status: "Pending",
      shelterId: shelter3,
      intakeDate: now - 86400000 * 60,
      createdAt: now,
      updatedAt: now,
    });

    // ── Applications ──
    await ctx.db.insert("applications", {
      animalId: buddy,
      applicantId: adopter1,
      applicantName: "Emily Johnson",
      applicantEmail: "emily@example.com",
      applicantPhone: "512-555-0004",
      housingType: "House",
      hasYard: true,
      yardFenced: true,
      householdMembers: 2,
      hasChildren: false,
      experienceLevel: "Experienced",
      personalStatement: "I have had dogs my whole life and recently lost my beloved lab. I am ready to open my heart to Buddy.",
      status: "UnderReview",
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 3,
    });

    await ctx.db.insert("applications", {
      animalId: charlie,
      applicantId: adopter2,
      applicantName: "James Wilson",
      applicantEmail: "james@example.com",
      applicantPhone: "512-555-0005",
      housingType: "House",
      hasYard: true,
      yardFenced: true,
      otherPets: "One cat (indoor)",
      householdMembers: 4,
      hasChildren: true,
      childrenAges: "6 and 9",
      experienceLevel: "SomeExperience",
      personalStatement: "Our family is looking for a gentle dog that would be great with our kids. Charlie seems perfect.",
      status: "Submitted",
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    });

    await ctx.db.insert("applications", {
      animalId: luna,
      applicantId: adopter1,
      applicantName: "Emily Johnson",
      applicantEmail: "emily@example.com",
      applicantPhone: "512-555-0004",
      housingType: "House",
      hasYard: true,
      yardFenced: true,
      householdMembers: 2,
      hasChildren: false,
      experienceLevel: "Experienced",
      personalStatement: "Luna would be a perfect companion for quiet evenings at home.",
      status: "Submitted",
      createdAt: now - 86400000 * 1,
      updatedAt: now - 86400000 * 1,
    });

    // ── Notifications ──
    await ctx.db.insert("notifications", {
      userId: staffUser1,
      type: "ApplicationSubmitted",
      title: "New Application Received",
      message: "Emily Johnson submitted an application for Buddy",
      link: "/review-applications",
      isRead: false,
      createdAt: now - 86400000 * 5,
    });

    await ctx.db.insert("notifications", {
      userId: adopter1,
      type: "ApplicationStatusChanged",
      title: "Application Under Review",
      message: "Your application for Buddy is now under review",
      link: "/my-applications",
      isRead: true,
      createdAt: now - 86400000 * 3,
    });

    await ctx.db.insert("notifications", {
      userId: adopter1,
      type: "AnimalStatusChanged",
      title: "New Animal Listed",
      message: "A new Golden Retriever named Buddy has been listed at Happy Tails Rescue",
      link: "/animals",
      isRead: false,
      createdAt: now - 86400000 * 30,
    });

    // ── User Settings ──
    await ctx.db.insert("userSettings", {
      userId: adopter1,
      emailNotifications: true,
      applicationUpdates: true,
      newAnimalAlerts: true,
      preferredSpecies: ["Dog", "Cat"],
      preferredSize: ["Medium", "Large"],
      updatedAt: now,
    });

    await ctx.db.insert("userSettings", {
      userId: adopter2,
      emailNotifications: true,
      applicationUpdates: true,
      newAnimalAlerts: false,
      preferredSpecies: ["Dog"],
      preferredSize: ["Medium"],
      updatedAt: now,
    });

    console.log("Seed data inserted successfully!");
  },
});