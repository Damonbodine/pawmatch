"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoleGuard } from "@/components/RoleGuard";
import { ApplicationsTable } from "@/components/applications/ApplicationsTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyApplicationsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <RoleGuard allowedRoles={["Adopter"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        {currentUser ? (
          <ApplicationsTable userId={currentUser._id} />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </div>
    </RoleGuard>
  );
}
