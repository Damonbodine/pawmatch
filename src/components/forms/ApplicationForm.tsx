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

interface ApplicationFormProps {
  animalId: Id<"animals">;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  onSuccess?: () => void;
}

export function ApplicationForm({ animalId, applicantName, applicantEmail, applicantPhone, onSuccess }: ApplicationFormProps) {
  const createApplication = useMutation(api.applications.create);
  const [loading, setLoading] = useState(false);
  const [housingType, setHousingType] = useState<"House" | "Apartment" | "Condo" | "Townhouse" | "Other">("House");
  const [hasYard, setHasYard] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<"FirstTime" | "SomeExperience" | "Experienced">("SomeExperience");
  const [personalStatement, setPersonalStatement] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createApplication({
        animalId,
        applicantName,
        applicantEmail,
        applicantPhone,
        housingType,
        hasYard,
        hasChildren,
        experienceLevel,
        personalStatement,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit application:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Housing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="housingType" className="text-foreground">Housing Type</Label>
            <Select value={housingType} onValueChange={(v: string | null) => setHousingType((v ?? "House") as typeof housingType)}>
              <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox id="hasYard" checked={hasYard} onCheckedChange={(v) => setHasYard(v === true)} />
            <Label htmlFor="hasYard" className="text-foreground">Has a yard</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Household Details</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasChildren" checked={hasChildren} onCheckedChange={(v) => setHasChildren(v === true)} />
            <Label htmlFor="hasChildren" className="text-foreground">Children in household</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Experience & Motivation</h3>
        <div className="space-y-2">
          <Label htmlFor="experienceLevel" className="text-foreground">Experience Level</Label>
          <Select value={experienceLevel} onValueChange={(v: string | null) => setExperienceLevel((v ?? "SomeExperience") as typeof experienceLevel)}>
            <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FirstTime">First Time</SelectItem>
              <SelectItem value="SomeExperience">Some Experience</SelectItem>
              <SelectItem value="Experienced">Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="personalStatement" className="text-foreground">Why do you want to adopt this animal?</Label>
          <Textarea id="personalStatement" value={personalStatement} onChange={(e) => setPersonalStatement(e.target.value)} required placeholder="Tell us why you'd be a great match..." rows={4} className="bg-background border-border" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
