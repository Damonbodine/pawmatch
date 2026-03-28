"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AnimalBioWriter } from "@/components/ai/AnimalBioWriter";
import { BehavioralAssessment } from "@/components/ai/BehavioralAssessment";

interface AnimalDetailViewProps {
  animalId: Id<"animals">;
}

export function AnimalDetailView({ animalId }: AnimalDetailViewProps) {
  const animal = useQuery(api.animals.getById, { animalId });

  if (animal === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!animal) {
    return <div className="p-8 text-center text-muted-foreground">Animal not found.</div>;
  }

  const statusColor: Record<string, string> = {
    available: "bg-secondary text-secondary-foreground",
    pending: "bg-primary text-primary-foreground",
    adopted: "bg-muted text-muted-foreground",
    fostered: "bg-accent text-accent-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
        {animal.photoUrl ? (
          <img
            src={animal.photoUrl}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
            No Photo Available
          </div>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{animal.name}</h1>
          <p className="text-muted-foreground">
            {animal.species} &middot; {animal.breed}
          </p>
        </div>
        <Badge className={statusColor[animal.status] ?? ""}>{animal.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoItem label="Age" value={String(animal.age)} />
            <InfoItem label="Gender" value={animal.gender} />
            <InfoItem label="Size" value={animal.size} />
            <InfoItem label="Species" value={animal.species} />
            <InfoItem label="Breed" value={animal.breed} />
            <InfoItem label="Status" value={animal.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About {animal.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{animal.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {animal.goodWithKids && <Badge variant="outline">Good with Kids</Badge>}
            {animal.goodWithDogs && <Badge variant="outline">Good with Dogs</Badge>}
            {animal.goodWithCats && <Badge variant="outline">Good with Cats</Badge>}
            {animal.isSpayedNeutered && <Badge variant="outline">Spayed/Neutered</Badge>}
            {animal.isVaccinated && <Badge variant="outline">Vaccinated</Badge>}
            {animal.isMicrochipped && <Badge variant="outline">Microchipped</Badge>}
          </div>
        </CardContent>
      </Card>

      {animal.adoptionFee !== undefined && (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <div>
            <span className="text-sm text-muted-foreground">Adoption Fee</span>
            <p className="text-2xl font-bold text-primary">${animal.adoptionFee}</p>
          </div>
          {animal.status === "Available" && (
            <Link href={`/applications/new?animalId=${animal._id}`} className={buttonVariants({ size: "lg" })}>Apply to Adopt</Link>
          )}
        </div>
      )}

      <AnimalBioWriter
        animalData={{
          name: animal.name,
          species: animal.species,
          breed: animal.breed,
          age: animal.age,
          gender: animal.gender,
          size: animal.size,
          temperament: animal.temperament,
          description: animal.description,
          medicalStatus: animal.medicalStatus,
          specialNeeds: animal.specialNeeds,
          goodWithKids: animal.goodWithKids,
          goodWithDogs: animal.goodWithDogs,
          goodWithCats: animal.goodWithCats,
        }}
      />

      <BehavioralAssessment
        animalData={{
          name: animal.name,
          species: animal.species,
          breed: animal.breed,
          age: animal.age,
          gender: animal.gender,
          size: animal.size,
          temperament: animal.temperament,
          description: animal.description,
          goodWithKids: animal.goodWithKids,
          goodWithDogs: animal.goodWithDogs,
          goodWithCats: animal.goodWithCats,
          specialNeeds: animal.specialNeeds,
        }}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}