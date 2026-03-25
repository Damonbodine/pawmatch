"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface AnimalFilters {
  species?: "Dog" | "Cat" | "Rabbit" | "Bird" | "Other";
  size?: "Small" | "Medium" | "Large";
  shelterId?: Id<"shelters">;
  search?: string;
}

interface AnimalFilterBarProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
}

export function AnimalFilterBar({ filters, onFiltersChange }: AnimalFilterBarProps) {
  const shelters = useQuery(api.shelters.list, {});

  const updateFilter = (key: keyof AnimalFilters, value: string | undefined) => {
    const next = { ...filters };
    if (!value || value === "all") {
      delete next[key];
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
    onFiltersChange(next);
  };

  const clearFilters = () => onFiltersChange({});

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <Select
        value={filters.species ?? "all"}
        onValueChange={(v) => updateFilter("species", v ?? undefined)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Species" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Species</SelectItem>
          <SelectItem value="Dog">Dog</SelectItem>
          <SelectItem value="Cat">Cat</SelectItem>
          <SelectItem value="Rabbit">Rabbit</SelectItem>
          <SelectItem value="Bird">Bird</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.size ?? "all"}
        onValueChange={(v) => updateFilter("size", v ?? undefined)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Sizes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sizes</SelectItem>
          <SelectItem value="Small">Small</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Large">Large</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.shelterId ?? "all"}
        onValueChange={(v) => updateFilter("shelterId", v ?? undefined)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Shelters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Shelters</SelectItem>
          {shelters?.map((s: any) => (
            <SelectItem key={s._id} value={s._id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
