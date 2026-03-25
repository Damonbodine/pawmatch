"use client";

import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { AnimalCreateForm } from "@/components/forms/AnimalCreateForm";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function NewAnimalPage() {
  const router = useRouter();
  const shelters = useQuery(api.shelters.list, {});
  const [selectedShelterId, setSelectedShelterId] = useState<string>("");

  return (
    <RoleGuard allowedRoles={["Admin", "ShelterStaff"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Add New Animal</h1>
        {!shelters ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-foreground">Select Shelter</Label>
              <Select value={selectedShelterId} onValueChange={(v: string | null) => setSelectedShelterId(v ?? "")}>
                <SelectTrigger className="w-[300px] bg-background border-border">
                  <SelectValue placeholder="Choose a shelter" />
                </SelectTrigger>
                <SelectContent>
                  {shelters.map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedShelterId && (
              <AnimalCreateForm
                shelterId={selectedShelterId as Id<"shelters">}
                onSuccess={() => router.push("/animals")}
              />
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
