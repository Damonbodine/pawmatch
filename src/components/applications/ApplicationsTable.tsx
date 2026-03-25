"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ApplicationsTableProps {
  userId?: Id<"users">;
  animalId?: Id<"animals">;
  status?: "Submitted" | "UnderReview" | "Approved" | "Rejected" | "Withdrawn";
}

const statusColors: Record<string, string> = {
  Submitted: "bg-primary text-primary-foreground",
  UnderReview: "bg-accent text-accent-foreground",
  Approved: "bg-secondary text-secondary-foreground",
  Rejected: "bg-destructive text-destructive-foreground",
  Withdrawn: "bg-muted text-muted-foreground",
};

export function ApplicationsTable({ userId, status }: ApplicationsTableProps) {
  const applications = userId
    ? useQuery(api.applications.listByUser, { userId, status })
    : useQuery(api.applications.listByStatus, { status: status ?? "Submitted" });

  if (!applications) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No applications found.</div>;
  }

  return (
    <Table>
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
        {applications.map((app: any) => (
          <TableRow key={app._id}>
            <TableCell className="font-medium text-foreground">
              {app.animalName ?? "Unknown"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {app.applicantName ?? "Unknown"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(app._creationTime).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[app.status] ?? ""}>{app.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/applications/${app._id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>Review</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}