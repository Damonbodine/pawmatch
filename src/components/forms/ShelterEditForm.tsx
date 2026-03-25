"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShelterData {
  _id: Id<"shelters">;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
}

interface ShelterEditFormProps {
  shelter: ShelterData;
  onSuccess?: () => void;
}

export function ShelterEditForm({ shelter, onSuccess }: ShelterEditFormProps) {
  const updateShelter = useMutation(api.shelters.update);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(shelter.name);
  const [address, setAddress] = useState(shelter.address);
  const [city, setCity] = useState(shelter.city);
  const [state, setState] = useState(shelter.state);
  const [zipCode, setZip] = useState(shelter.zipCode);
  const [phone, setPhone] = useState(shelter.phone);
  const [email, setEmail] = useState(shelter.email);
  const [website, setWebsite] = useState(shelter.website ?? "");
  const [description, setDescription] = useState(shelter.description ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateShelter({
        shelterId: shelter._id,
        name,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website: website || undefined,
        description: description || undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update shelter:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Shelter Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-foreground">Street Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="bg-background border-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-foreground">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-foreground">State</Label>
          <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-foreground">ZIP Code</Label>
          <Input id="zipCode" value={zipCode} onChange={(e) => setZip(e.target.value)} required className="bg-background border-border" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">Phone</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website" className="text-foreground">Website</Label>
        <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}