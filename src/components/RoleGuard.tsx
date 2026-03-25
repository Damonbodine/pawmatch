"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

type Role = "Admin" | "ShelterStaff" | "Adopter";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Not Authenticated</h2>
        <p className="text-sm text-muted-foreground">Please sign in to access this page.</p>
      </div>
    );
  }

  const userRole = currentUser.role as Role;

  if (!allowedRoles.includes(userRole)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Unauthorized</h2>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this page. Required role: {allowedRoles.join(" or ")}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
