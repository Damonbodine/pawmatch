"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { SheltersTable } from "@/components/shelters/SheltersTable";

export default function SheltersPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Shelters</h1>
        <SheltersTable />
      </div>
    </RoleGuard>
  );
}
