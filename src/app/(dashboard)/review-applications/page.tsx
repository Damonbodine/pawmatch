"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";

export default function ReviewApplicationsPage() {
  return (
    <RoleGuard allowedRoles={["ShelterStaff", "Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Review Applications</h1>
        <ApplicationsTable />
      </div>
    </RoleGuard>
  );
}
