"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { StaffAssignForm } from "@/components/forms/StaffAssignForm";

export default function ShelterStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Manage Staff</h1>
        <StaffAssignForm shelterId={id as Id<"shelters">} />
      </div>
    </RoleGuard>
  );
}
