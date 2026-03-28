"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2 } from "lucide-react";

interface AssessmentRating {
  rating: string;
  detail: string;
}

interface AssessmentResult {
  sociability: AssessmentRating;
  energyLevel: AssessmentRating;
  trainingNeeds: AssessmentRating;
  idealHome: string;
}

interface BehavioralAssessmentProps {
  animalData: Record<string, unknown>;
}

const ratingColor = (rating: string) => {
  const lower = rating.toLowerCase();
  if (lower === "high" || lower === "significant") return "bg-primary text-primary-foreground";
  if (lower === "medium" || lower === "moderate") return "bg-secondary text-secondary-foreground";
  return "bg-muted text-muted-foreground";
};

export function BehavioralAssessment({ animalData }: BehavioralAssessmentProps) {
  const assess = useAction(api.ai.generateBehavioralAssessment);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssess = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assess({ animalData });
      setResult(data as AssessmentResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Behavioral Assessment
        </CardTitle>
        {!result && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssess}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assessing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Assess
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <AssessmentRow label="Sociability" rating={result.sociability} />
            <AssessmentRow label="Energy Level" rating={result.energyLevel} />
            <AssessmentRow label="Training Needs" rating={result.trainingNeeds} />

            <div className="p-3 bg-muted rounded-md space-y-1">
              <span className="text-sm font-medium text-foreground">Ideal Home</span>
              <p className="text-sm text-muted-foreground">{result.idealHome}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAssess}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Re-assess
            </Button>
          </div>
        )}

        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Click &ldquo;Assess&rdquo; to generate an AI behavioral profile for this animal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AssessmentRow({ label, rating }: { label: string; rating: AssessmentRating }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Badge className={ratingColor(rating.rating)}>{rating.rating}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{rating.detail}</p>
    </div>
  );
}
