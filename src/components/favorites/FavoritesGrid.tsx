"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import Link from "next/link";

export function FavoritesGrid() {
  const favorites = useQuery(api.favoriteAnimals.listByUser);
  const toggleFavorite = useMutation(api.favoriteAnimals.toggle);

  if (!favorites) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Heart className="h-12 w-12 mb-3" />
        <p className="text-lg">No favorites yet.</p>
        <p className="text-sm mt-1">Browse animals and save your favorites!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((animal: any) => (
        <Card key={animal._id} className="overflow-hidden group hover:shadow-lg transition-shadow border-border">
          <Link href={`/animals/${animal._id}`}>
            <div className="relative h-48 bg-muted overflow-hidden">
              {animal.imageUrl ? (
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No Photo</div>
              )}
              <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
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
                onClick={() => toggleFavorite({ animalId: animal._id })}
              >
                <Heart className="h-5 w-5 fill-primary text-primary" />
              </Button>
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