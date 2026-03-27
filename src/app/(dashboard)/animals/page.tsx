"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { AnimalFilterBar, AnimalFilters } from "@/components/animals/AnimalFilterBar";
import { AnimalCardGrid } from "@/components/animals/AnimalCardGrid";

export default function AnimalsPage() {
  const [filters, setFilters] = useState<AnimalFilters>({});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Browse Animals</h1>
      <AnimalFilterBar filters={filters} onFiltersChange={setFilters} />
      <AnimalCardGrid filters={filters} />
    </div>
  );
}
