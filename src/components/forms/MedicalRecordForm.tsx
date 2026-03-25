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

interface MedicalRecordFormProps {
  animalId: Id<"animals">;
  onSuccess?: () => void;
}

export function MedicalRecordForm({ animalId, onSuccess }: MedicalRecordFormProps) {
  const createRecord = useMutation(api.animalMedicalRecords.create);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"Vaccination" | "Treatment" | "Checkup" | "Surgery" | "Medication">("Checkup");
  const [description, setDescription] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [date, setDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRecord({
        animalId,
        type,
        description,
        veterinarian: veterinarian || undefined,
        date: new Date(date).getTime(),
        nextDueDate: nextDueDate ? new Date(nextDueDate).getTime() : undefined,
      });
      setDescription("");
      setVeterinarian("");
      setDate("");
      setNextDueDate("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create medical record:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-foreground">Record Type</Label>
          <Select value={type} onValueChange={(v: string | null) => setType((v ?? "Checkup") as typeof type)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Vaccination">Vaccination</SelectItem>
              <SelectItem value="Treatment">Treatment</SelectItem>
              <SelectItem value="Checkup">Checkup</SelectItem>
              <SelectItem value="Surgery">Surgery</SelectItem>
              <SelectItem value="Medication">Medication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="veterinarian" className="text-foreground">Veterinarian (optional)</Label>
          <Input id="veterinarian" value={veterinarian} onChange={(e) => setVeterinarian(e.target.value)} placeholder="Dr. Smith" className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-foreground">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextDueDate" className="text-foreground">Next Due Date (optional)</Label>
          <Input id="nextDueDate" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className="bg-background border-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Details about the medical event..." rows={3} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Add Medical Record"}
      </Button>
    </form>
  );
}
