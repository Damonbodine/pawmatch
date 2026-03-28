"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

type Tone = "heartwarming" | "playful" | "dignified";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "heartwarming", label: "Heartwarming", description: "Warm and emotional" },
  { value: "playful", label: "Playful", description: "Fun and energetic" },
  { value: "dignified", label: "Dignified", description: "Calm and refined" },
];

interface AnimalBioWriterProps {
  animalData: Record<string, unknown>;
}

export function AnimalBioWriter({ animalData }: AnimalBioWriterProps) {
  const generateBio = useAction(api.ai.generateAnimalBio);
  const [selectedTone, setSelectedTone] = useState<Tone>("heartwarming");
  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBio({ animalData, tone: selectedTone });
      setBio(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate bio.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (bio) {
      await navigator.clipboard.writeText(bio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Bio Writer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Select Tone</span>
          <div className="flex gap-2">
            {TONE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedTone === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTone(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {TONE_OPTIONS.find((o) => o.value === selectedTone)?.description}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {bio ? "Regenerate Bio" : "Generate Bio"}
            </>
          )}
        </Button>

        {loading && <Skeleton className="h-32 w-full" />}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
        )}

        {bio && !loading && (
          <div className="relative">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{bio}</p>
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
      </CardContent>
    </Card>
  );
}
