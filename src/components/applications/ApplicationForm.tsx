"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationFormProps {
  animalId: Id<"animals">;
  applicantId: Id<"users">;
}

export function ApplicationForm({ animalId, applicantId }: ApplicationFormProps) {
  const animal = useQuery(api.animals.getById, { animalId });
  const currentUser = useQuery(api.users.getById, { userId: applicantId });
  const createApplication = useMutation(api.applications.create);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [housingType, setHousingType] = useState<string>("");
  const [hasYard, setHasYard] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (animal === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!housingType) { setError("Please select a housing type."); return; }
    if (!experienceLevel) { setError("Please select your experience level."); return; }
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createApplication({
        animalId,
        applicantName: currentUser?.name ?? "",
        applicantEmail: currentUser?.email ?? "",
        applicantPhone: currentUser?.phone ?? "",
        housingType: housingType as "House" | "Apartment" | "Condo" | "Townhouse" | "Other",
        hasYard,
        hasChildren,
        experienceLevel: experienceLevel as "FirstTime" | "SomeExperience" | "Experienced",
        personalStatement: formData.get("personalStatement") as string,
      });
      router.push("/my-applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Adoption Application</CardTitle>
        <CardDescription>
          {animal ? `Applying to adopt ${animal.name}` : "Animal not found"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Housing Type</Label>
            <Select value={housingType} onValueChange={(v: string | null) => setHousingType(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select housing type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasYard" checked={hasYard} onCheckedChange={(v) => setHasYard(v === true)} />
            <Label htmlFor="hasYard">I have a yard</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasChildren" checked={hasChildren} onCheckedChange={(v) => setHasChildren(v === true)} />
            <Label htmlFor="hasChildren">I have children in my household</Label>
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select value={experienceLevel} onValueChange={(v: string | null) => setExperienceLevel(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FirstTime">First Time Pet Owner</SelectItem>
                <SelectItem value="SomeExperience">Some Experience</SelectItem>
                <SelectItem value="Experienced">Experienced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalStatement">Why do you want to adopt this animal?</Label>
            <Textarea
              id="personalStatement"
              name="personalStatement"
              placeholder="Tell us why you'd be a great match..."
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
