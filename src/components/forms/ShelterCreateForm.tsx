"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShelterCreateFormProps {
  onSuccess?: () => void;
}

export function ShelterCreateForm({ onSuccess }: ShelterCreateFormProps) {
  const createShelter = useMutation(api.shelters.create);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [capacity, setCapacity] = useState<number>(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createShelter({
        name,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website: website || undefined,
        description: description || undefined,
        operatingHours,
        capacity,
      });
      setName("");
      setAddress("");
      setCity("");
      setState("");
      setZipCode("");
      setPhone("");
      setEmail("");
      setWebsite("");
      setDescription("");
      setOperatingHours("");
      setCapacity(50);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create shelter:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Shelter Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Shelter name" className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-foreground">Street Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="123 Main St" className="bg-background border-border" />
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
          <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required className="bg-background border-border" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">Phone</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(555) 123-4567" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="info@shelter.org" className="bg-background border-border" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="operatingHours" className="text-foreground">Operating Hours</Label>
          <Input id="operatingHours" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} required placeholder="Mon-Fri 9am-5pm" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-foreground">Capacity</Label>
          <Input id="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required className="bg-background border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website" className="text-foreground">Website (optional)</Label>
        <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="About this shelter..." rows={3} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Shelter"}
      </Button>
    </form>
  );
}
