"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Copy, Check, Mail } from "lucide-react";

interface FollowUpEmailGeneratorProps {
  animalData: Record<string, unknown>;
  applicantData: Record<string, unknown>;
}

export function FollowUpEmailGenerator({ animalData, applicantData }: FollowUpEmailGeneratorProps) {
  const generateEmail = useAction(api.ai.generateFollowUpEmail);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateEmail({ animalData, applicantData });
      setEmail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate follow-up email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (email) {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Follow-Up Email Generator
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {email ? "Regenerate" : "Generate Email"}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-48 w-full" />}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        {email && !loading && (
          <div className="relative">
            <div className="p-4 bg-muted rounded-md">
              <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                {email}
              </pre>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="absolute top-2 right-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {!email && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Generate a personalized 2-week check-in email for the adopter based on the animal&apos;s needs and the adopter&apos;s situation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
