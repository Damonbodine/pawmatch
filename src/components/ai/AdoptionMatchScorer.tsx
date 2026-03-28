"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface MatchFactor {
  name: string;
  score: number;
  detail: string;
}

interface MatchResult {
  score: number;
  factors: MatchFactor[];
  summary: string;
}

interface AdoptionMatchScorerProps {
  animalData: Record<string, unknown>;
  applicantData: Record<string, unknown>;
}

export function AdoptionMatchScorer({ animalData, applicantData }: AdoptionMatchScorerProps) {
  const scoreMatch = useAction(api.ai.scoreAdoptionMatch);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scoreMatch({ animalData, applicantData });
      setResult(data as MatchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate match score.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return "bg-green-400/20";
    if (score >= 60) return "bg-yellow-400/20";
    if (score >= 40) return "bg-orange-400/20";
    return "bg-red-400/20";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Adoption Match Score
        </CardTitle>
        {!result && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleScore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Match
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className={`text-6xl font-bold ${scoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
              <div className={`w-full h-3 rounded-full bg-muted overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all ${scoreBg(result.score)} ${scoreColor(result.score).replace("text-", "bg-")}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {result.factors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Factor Breakdown</h4>
                {result.factors.map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{factor.name}</span>
                      <Badge variant="outline" className={scoreColor(factor.score)}>
                        {factor.score}/100
                      </Badge>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBg(factor.score)} ${scoreColor(factor.score).replace("text-", "bg-")}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.detail}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-foreground">{result.summary}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleScore}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>
          </div>
        )}

        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Click &ldquo;Analyze Match&rdquo; to get an AI-powered compatibility assessment between this adopter and animal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
