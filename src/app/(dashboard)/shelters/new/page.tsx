"use client";

import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { ShelterCreateForm } from "@/components/forms/ShelterCreateForm";

export default function NewShelterPage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Shelter</h1>
        <ShelterCreateForm onSuccess={() => router.push("/shelters")} />
      </div>
    </RoleGuard>
  );
}
