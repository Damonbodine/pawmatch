"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AiGenerateButton } from "@/components/ai-generate-button";

interface AnimalCreateFormProps {
  shelterId: Id<"shelters">;
  onSuccess?: () => void;
}

export function AnimalCreateForm({ shelterId, onSuccess }: AnimalCreateFormProps) {
  const createAnimal = useMutation(api.animals.create);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"Dog" | "Cat" | "Rabbit" | "Bird" | "Other">("Dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<"Puppy/Kitten" | "Young" | "Adult" | "Senior">("Adult");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [size, setSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [description, setDescription] = useState("");
  const [temperament, setTemperament] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [medicalStatus, setMedicalStatus] = useState<"Healthy" | "NeedsTreatment" | "SpecialNeeds">("Healthy");
  const [isSpayedNeutered, setIsSpayedNeutered] = useState(false);
  const [isVaccinated, setIsVaccinated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAnimal({
        shelterId,
        name,
        species,
        breed,
        age,
        gender,
        size,
        description,
        temperament: temperament || undefined,
        specialNeeds: specialNeeds || undefined,
        photoUrl: photoUrl || undefined,
        medicalStatus,
        isSpayedNeutered,
        isVaccinated,
      });
      setName("");
      setBreed("");
      setDescription("");
      setPhotoUrl("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create animal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Animal name" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="species" className="text-foreground">Species</Label>
          <Select value={species} onValueChange={(v: string | null) => setSpecies((v ?? "Dog") as typeof species)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="Rabbit">Rabbit</SelectItem>
              <SelectItem value="Bird">Bird</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed" className="text-foreground">Breed</Label>
          <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} required placeholder="Breed or mix" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age" className="text-foreground">Age Group</Label>
          <Select value={age} onValueChange={(v: string | null) => setAge((v ?? "Adult") as typeof age)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Puppy/Kitten">Puppy/Kitten</SelectItem>
              <SelectItem value="Young">Young</SelectItem>
              <SelectItem value="Adult">Adult</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-foreground">Gender</Label>
          <Select value={gender} onValueChange={(v: string | null) => setGender((v ?? "Male") as typeof gender)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size" className="text-foreground">Size</Label>
          <Select value={size} onValueChange={(v: string | null) => setSize((v ?? "Medium") as typeof size)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Small">Small</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicalStatus" className="text-foreground">Medical Status</Label>
          <Select value={medicalStatus} onValueChange={(v: string | null) => setMedicalStatus((v ?? "Healthy") as typeof medicalStatus)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Healthy">Healthy</SelectItem>
              <SelectItem value="NeedsTreatment">Needs Treatment</SelectItem>
              <SelectItem value="SpecialNeeds">Special Needs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoUrl" className="text-foreground">Photo URL</Label>
          <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="bg-background border-border" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="isSpayedNeutered" checked={isSpayedNeutered} onCheckedChange={(v) => setIsSpayedNeutered(v === true)} />
          <Label htmlFor="isSpayedNeutered" className="text-foreground">Spayed/Neutered</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isVaccinated" checked={isVaccinated} onCheckedChange={(v) => setIsVaccinated(v === true)} />
          <Label htmlFor="isVaccinated" className="text-foreground">Vaccinated</Label>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <AiGenerateButton
            fieldName="animalDescription"
            context={{ name, species, breed, age, gender, size, medicalStatus, isSpayedNeutered, isVaccinated }}
            onGenerated={setDescription}
            disabled={loading}
          />
        </div>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Personality, background, and any special notes..." rows={4} className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperament" className="text-foreground">Temperament</Label>
          <AiGenerateButton
            fieldName="animalTemperament"
            context={{ name, species, breed, age, gender, size }}
            onGenerated={setTemperament}
            disabled={loading}
          />
        </div>
        <Textarea id="temperament" value={temperament} onChange={(e) => setTemperament(e.target.value)} placeholder="Energy level, sociability, training status..." rows={3} className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="specialNeeds" className="text-foreground">Special Needs</Label>
          <AiGenerateButton
            fieldName="animalSpecialNeeds"
            context={{ name, species, breed, age, medicalStatus }}
            onGenerated={setSpecialNeeds}
            disabled={loading}
          />
        </div>
        <Textarea id="specialNeeds" value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} placeholder="Medical conditions, dietary needs, accommodations..." rows={3} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Animal"}
      </Button>
    </form>
  );
}
