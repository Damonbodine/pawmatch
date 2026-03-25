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

interface AnimalEditFormProps {
  animal: {
    _id: Id<"animals">;
    name: string;
    breed: string;
    age: "Puppy/Kitten" | "Young" | "Adult" | "Senior";
    size: "Small" | "Medium" | "Large";
    description: string;
    photoUrl?: string;
    status: "Available" | "Pending" | "Adopted" | "OnHold";
  };
  onSuccess?: () => void;
}

export function AnimalEditForm({ animal, onSuccess }: AnimalEditFormProps) {
  const updateAnimal = useMutation(api.animals.update);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(animal.name);
  const [breed, setBreed] = useState(animal.breed);
  const [age, setAge] = useState(animal.age);
  const [size, setSize] = useState(animal.size);
  const [description, setDescription] = useState(animal.description);
  const [photoUrl, setPhotoUrl] = useState(animal.photoUrl ?? "");
  const [status, setStatus] = useState(animal.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAnimal({
        animalId: animal._id,
        name,
        breed,
        age,
        size,
        description,
        photoUrl: photoUrl || undefined,
        status,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update animal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed" className="text-foreground">Breed</Label>
          <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} required className="bg-background border-border" />
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
          <Label htmlFor="status" className="text-foreground">Status</Label>
          <Select value={status} onValueChange={(v: string | null) => setStatus((v ?? "Available") as typeof status)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Adopted">Adopted</SelectItem>
              <SelectItem value="OnHold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoUrl" className="text-foreground">Photo URL</Label>
          <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." className="bg-background border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
