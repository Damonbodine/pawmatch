"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputFormProps {
  applicationId: Id<"applications">;
  onSuccess?: () => void;
}

export function MessageInputForm({ applicationId, onSuccess }: MessageInputFormProps) {
  const sendMessage = useMutation(api.messages.send);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await sendMessage({
        applicationId,
        content: content.trim(),
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your message..." rows={2} className="bg-background border-border resize-none" />
      </div>
      <Button type="submit" disabled={loading || !content.trim()}>
        {loading ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}
