"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { AnimalFilterBar, AnimalFilters } from "@/components/animals/AnimalFilterBar";
import { AnimalCardGrid } from "@/components/animals/AnimalCardGrid";

export default function AnimalsPage() {
  const [filters, setFilters] = useState<AnimalFilters>({});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Browse Animals</h1>
      <AnimalFilterBar filters={filters} onFiltersChange={setFilters} />
      <div data-demo="animals-grid">
        <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-card/40" />}>
          <AnimalCardGrid filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
