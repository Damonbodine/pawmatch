"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewNotesFormProps {
  applicationId: Id<"applications">;
  onSuccess?: () => void;
}

export function ReviewNotesForm({ applicationId, onSuccess }: ReviewNotesFormProps) {
  const approveApplication = useMutation(api.applications.approve);
  const rejectApplication = useMutation(api.applications.reject);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setAction("approve");
    setLoading(true);
    try {
      await approveApplication({
        applicationId,
        reviewNotes: notes || undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to approve application:", error);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setAction("reject");
    setLoading(true);
    try {
      await rejectApplication({
        applicationId,
        rejectionReason: notes,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to reject application:", error);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-foreground">Review Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add your review notes here... (required for rejection)" rows={4} className="bg-background border-border" />
      </div>
      <div className="flex gap-3">
        <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          {loading && action === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1">
          {loading && action === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}