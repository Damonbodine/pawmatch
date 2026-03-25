import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    entityType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
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

    const takeLimit = args.limit ?? 100;

    if (args.entityType) {
      const logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType!))
        .order("desc")
        .take(takeLimit);

      const result = [];
      for (const log of logs) {
        const user = await ctx.db.get(log.userId);
        result.push({ ...log, user });
      }
      return result;
    }

    if (args.userId) {
      const logs = await ctx.db
        .query("auditLogs")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(takeLimit);

      const result = [];
      for (const log of logs) {
        const user = await ctx.db.get(log.userId);
        result.push({ ...log, user });
      }
      return result;
    }

    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(takeLimit);

    const result = [];
    for (const log of logs) {
      const user = await ctx.db.get(log.userId);
      result.push({ ...log, user });
    }
    return result;
  },
});
