"use client";

export const dynamic = "force-dynamic";

import { Suspense, use } from "react";
import { AnimalDetailView } from "@/components/animals/AnimalDetailView";
import { Id } from "@/convex/_generated/dataModel";

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-card/40" />}>
        <AnimalDetailView animalId={id as Id<"animals">} />
      </Suspense>
    </div>
  );
}
