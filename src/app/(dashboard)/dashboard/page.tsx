"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <DashboardStatCards />
      </div>
    </RoleGuard>
  );
}
