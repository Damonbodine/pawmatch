"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { AnimalEditForm } from "@/components/forms/AnimalEditForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const animal = useQuery(api.animals.getById, { animalId: id as Id<"animals"> });

  return (
    <RoleGuard allowedRoles={["Admin", "ShelterStaff"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Animal</h1>
        {animal === undefined ? (
          <Skeleton className="h-64 w-full" />
        ) : animal === null ? (
          <p className="text-muted-foreground">Animal not found.</p>
        ) : (
          <AnimalEditForm
            animal={animal}
            onSuccess={() => router.push(`/animals/${id}`)}
          />
        )}
      </div>
    </RoleGuard>
  );
}
