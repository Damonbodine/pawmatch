"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <RoleGuard allowedRoles={["Adopter"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Submit Application</h1>
        {currentUser ? (
          <ApplicationForm
            animalId={id as Id<"animals">}
            applicantName={currentUser.name}
            applicantEmail={currentUser.email}
            applicantPhone={currentUser.phone ?? ""}
            onSuccess={() => router.push("/my-applications")}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </div>
    </RoleGuard>
  );
}
