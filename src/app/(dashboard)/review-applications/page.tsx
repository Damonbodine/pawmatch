"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

const statusColors: Record<string, string> = {
  Submitted: "bg-primary text-primary-foreground",
  UnderReview: "bg-accent text-accent-foreground",
  Approved: "bg-secondary text-secondary-foreground",
  Rejected: "bg-destructive text-destructive-foreground",
  Withdrawn: "bg-muted text-muted-foreground",
};

function ReviewApplicationsPageContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const searchParams = useSearchParams();
  const staffAssignments = useQuery(
    api.staffAssignments.listByUser,
    currentUser && currentUser.role === "ShelterStaff" ? { userId: currentUser._id } : "skip"
  );

  // Determine the shelterId for staff scoping
  const activeAssignment = staffAssignments?.find((a: any) => a.isActive);
  const staffShelterId = activeAssignment?.shelterId;

  // Admin sees all submitted apps; staff sees only their shelter's
  const applications = useQuery(
    api.applications.listByStatus,
    currentUser && (currentUser.role === "Admin" || currentUser.role === "ShelterStaff")
      ? {
          status: "Submitted" as const,
          ...(currentUser.role === "ShelterStaff" && staffShelterId ? { shelterId: staffShelterId } : {}),
        }
      : "skip"
  );

  // Loading
  if (currentUser === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not authenticated
  if (currentUser === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Setting up your account...</p>
      </div>
    );
  }

  // Adopters cannot access this page
  if (currentUser.role === "Adopter") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          This page is only accessible to shelter staff and administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Review Applications</h1>
      {!applications ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">No pending applications to review.</div>
      ) : (
        <Table data-demo="review-applications-table">
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app: any, index: number) => (
              <TableRow key={app._id}>
                <TableCell className="font-medium text-foreground">
                  {app.animal?.name ?? "Unknown"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {app.applicant?.name ?? app.applicantName ?? "Unknown"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(app._creationTime).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[app.status] ?? ""}>{app.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={withPreservedDemoQuery(`/review-applications/${app._id}`, searchParams)}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                    data-demo={index === 0 ? "primary-review-link" : undefined}
                  >
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function ReviewApplicationsPage() {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <ReviewApplicationsPageContent />
    </Suspense>
  );
}
