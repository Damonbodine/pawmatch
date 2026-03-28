"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

export interface AnimalFilters {
  species?: "Dog" | "Cat" | "Rabbit" | "Bird" | "Other";
  size?: "Small" | "Medium" | "Large";
  status?: "Available" | "Pending" | "Adopted" | "OnHold";
  shelterId?: Id<"shelters">;
  search?: string;
}

interface AnimalCardGridProps {
  filters?: AnimalFilters;
}

const statusColors: Record<string, string> = {
  available: "bg-secondary text-secondary-foreground",
  pending: "bg-primary text-primary-foreground",
  adopted: "bg-muted text-muted-foreground",
  fostered: "bg-accent text-accent-foreground",
};

export function AnimalCardGrid({ filters }: AnimalCardGridProps) {
  const animals = useQuery(api.animals.list, filters ?? {});
  const toggleFavorite = useMutation(api.favoriteAnimals.toggle);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();

  const handleToggleFavorite = async (animalId: Id<"animals">) => {
    setTogglingIds((prev) => new Set(prev).add(animalId));
    try {
      await toggleFavorite({ animalId });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(animalId);
        return next;
      });
    }
  };

  if (!animals) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">No animals found matching your criteria.</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {animals.map((animal: any, index: number) => (
        <Card
          key={animal._id}
          className="overflow-hidden group hover:shadow-lg transition-shadow border-border"
        >
          <Link
            href={withPreservedDemoQuery(`/animals/${animal._id}`, searchParams)}
            data-demo={index === 0 ? "primary-animal-card" : undefined}
          >
            <div className="relative h-48 bg-muted overflow-hidden">
              {animal.photoUrl ? (
                <img
                  src={animal.photoUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Photo
                </div>
              )}
              <Badge className={`absolute top-2 right-2 ${statusColors[animal.status] ?? ""}`}>
                {animal.status}
              </Badge>
            </div>
          </Link>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{animal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {animal.species} &middot; {animal.breed}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                disabled={togglingIds.has(animal._id)}
                onClick={() => handleToggleFavorite(animal._id)}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">{animal.size}</Badge>
              <Badge variant="outline">Age: {animal.age}</Badge>
            </div>
          </CardContent>
          <CardFooter className="px-4 pb-4 pt-0">
            <span className="text-sm font-medium text-primary">
              {animal.adoptionFee ? `$${animal.adoptionFee}` : "Fee TBD"}
            </span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
