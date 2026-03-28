"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { AdoptionMatchScorer } from "@/components/ai/AdoptionMatchScorer";
import { FollowUpEmailGenerator } from "@/components/ai/FollowUpEmailGenerator";

interface ReviewDetailViewProps {
  applicationId: Id<"applications">;
}

export function ReviewDetailView({ applicationId }: ReviewDetailViewProps) {
  const application = useQuery(api.applications.getById, { applicationId });
  const approve = useMutation(api.applications.approve);
  const reject = useMutation(api.applications.reject);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (application === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!application) {
    return <div className="p-8 text-center text-muted-foreground">Application not found.</div>;
  }

  const statusColors: Record<string, string> = {
    pending: "bg-primary text-primary-foreground",
    approved: "bg-secondary text-secondary-foreground",
    rejected: "bg-destructive text-destructive-foreground",
    withdrawn: "bg-muted text-muted-foreground",
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setActionError(null);
    try {
      await approve({ applicationId, reviewNotes: reviewNotes || undefined });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      setActionError("Please provide a reason for rejection.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    try {
      await reject({ applicationId, rejectionReason: reviewNotes });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Application Review</h1>
        <Badge className={statusColors[application.status] ?? ""}>{application.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Applicant Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <InfoField label="Name" value={application.applicantName ?? "N/A"} />
          <InfoField label="Email" value={application.applicantEmail ?? "N/A"} />
          <InfoField label="Housing Type" value={application.housingType} />
          <InfoField label="Has Yard" value={application.hasYard ? "Yes" : "No"} />
          <InfoField label="Other Pets" value={application.otherPets ?? "None"} />
          <InfoField label="Has Children" value={application.hasChildren ? "Yes" : "No"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Experience & Reason</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Experience Level</span>
            <p className="text-foreground mt-1">{application.experienceLevel}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Personal Statement</span>
            <p className="text-foreground mt-1">{application.personalStatement}</p>
          </div>
        </CardContent>
      </Card>

      {(application.status === "Submitted" || application.status === "UnderReview") && (
        <>
          <AdoptionMatchScorer
            animalData={application.animal ? {
              name: application.animal.name,
              species: application.animal.species,
              breed: application.animal.breed,
              age: application.animal.age,
              size: application.animal.size,
              temperament: application.animal.temperament,
              medicalStatus: application.animal.medicalStatus,
              specialNeeds: application.animal.specialNeeds,
              goodWithKids: application.animal.goodWithKids,
              goodWithDogs: application.animal.goodWithDogs,
              goodWithCats: application.animal.goodWithCats,
            } : {}}
            applicantData={{
              housingType: application.housingType,
              hasYard: application.hasYard,
              yardFenced: application.yardFenced,
              otherPets: application.otherPets,
              householdMembers: application.householdMembers,
              hasChildren: application.hasChildren,
              childrenAges: application.childrenAges,
              experienceLevel: application.experienceLevel,
              personalStatement: application.personalStatement,
            }}
          />

          <Card>
            <CardHeader><CardTitle>Review Decision</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {actionError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{actionError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes / Rejection Reason</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {isProcessing ? "Processing..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {application.status === "Approved" && (
        <FollowUpEmailGenerator
          animalData={application.animal ? {
            name: application.animal.name,
            species: application.animal.species,
            breed: application.animal.breed,
            age: application.animal.age,
            temperament: application.animal.temperament,
            medicalStatus: application.animal.medicalStatus,
            specialNeeds: application.animal.specialNeeds,
            goodWithKids: application.animal.goodWithKids,
            goodWithDogs: application.animal.goodWithDogs,
            goodWithCats: application.animal.goodWithCats,
          } : {}}
          applicantData={{
            name: application.applicantName,
            email: application.applicantEmail,
            housingType: application.housingType,
            hasYard: application.hasYard,
            otherPets: application.otherPets,
            hasChildren: application.hasChildren,
            experienceLevel: application.experienceLevel,
          }}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}