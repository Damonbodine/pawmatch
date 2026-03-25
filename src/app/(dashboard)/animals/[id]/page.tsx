"use client";

import { use } from "react";
import { AnimalDetailView } from "@/components/animals/AnimalDetailView";
import { Id } from "@/convex/_generated/dataModel";

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <AnimalDetailView animalId={id as Id<"animals">} />
    </div>
  );
}
