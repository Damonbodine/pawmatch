"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ShelterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const shelter = useQuery(api.shelters.getById, { shelterId: id as Id<"shelters"> });

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Shelter Details</h1>
        {shelter === undefined ? (
          <Skeleton className="h-64 w-full" />
        ) : shelter === null ? (
          <p className="text-muted-foreground">Shelter not found.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{shelter.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{shelter.address}, {shelter.city}, {shelter.state} {shelter.zipCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{shelter.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{shelter.email}</p>
                </div>
                {shelter.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p>{shelter.website}</p>
                  </div>
                )}
              </div>
              {shelter.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{shelter.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Link href={`/shelters/${id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit</Link>
                <Link href={`/shelters/${id}/staff`} className={buttonVariants({ variant: "outline" })}>Manage Staff</Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
