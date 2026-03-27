"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { ReviewDetailView } from "@/components/applications/ReviewDetailView";

export default function ReviewApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RoleGuard allowedRoles={["ShelterStaff", "Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Review Application</h1>
        <ReviewDetailView applicationId={id as Id<"applications">} />
      </div>
    </RoleGuard>
  );
}
