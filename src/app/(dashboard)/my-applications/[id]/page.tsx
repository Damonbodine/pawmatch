"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const application = useQuery(api.applications.getById, { applicationId: id as Id<"applications"> });

  return (
    <RoleGuard allowedRoles={["Adopter"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Application Details</h1>
        {application === undefined ? (
          <Skeleton className="h-64 w-full" />
        ) : application === null ? (
          <p className="text-muted-foreground">Application not found.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Application</span>
                <Badge>{application.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p>{application.personalStatement}</p>
              </div>
              {application.reviewNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{application.reviewNotes}</p>
                </div>
              )}
              <Link href={`/my-applications/${id}/messages`} className={buttonVariants({ variant: "outline" })}>View Messages</Link>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
