"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { MedicalRecordsList } from "@/components/animals/MedicalRecordsList";
import { MedicalRecordForm } from "@/components/forms/MedicalRecordForm";

export default function MedicalRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const animalId = id as Id<"animals">;

  return (
    <RoleGuard allowedRoles={["Admin", "ShelterStaff"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
        <MedicalRecordForm animalId={animalId} />
        <MedicalRecordsList animalId={animalId} />
      </div>
    </RoleGuard>
  );
}
