"use client";

export const dynamic = "force-dynamic";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";

export default function StaffDashboardPage() {
  return (
    <RoleGuard allowedRoles={["ShelterStaff"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <DashboardStatCards />
      </div>
    </RoleGuard>
  );
}
