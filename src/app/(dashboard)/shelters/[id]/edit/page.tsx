"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { ShelterEditForm } from "@/components/forms/ShelterEditForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditShelterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const shelter = useQuery(api.shelters.getById, { shelterId: id as Id<"shelters"> });

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Shelter</h1>
        {shelter === undefined ? (
          <Skeleton className="h-64 w-full" />
        ) : shelter === null ? (
          <p className="text-muted-foreground">Shelter not found.</p>
        ) : (
          <ShelterEditForm
            shelter={shelter}
            onSuccess={() => router.push(`/shelters/${id}`)}
          />
        )}
      </div>
    </RoleGuard>
  );
}
