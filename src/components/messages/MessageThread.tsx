"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface MessageThreadProps {
  applicationId: Id<"applications">;
  recipientId: Id<"users">;
  currentUserId: Id<"users">;
}

export function MessageThread({ applicationId, recipientId, currentUserId }: MessageThreadProps) {
  const messages = useQuery(api.messages.listByApplication, { applicationId });
  const sendMessage = useMutation(api.messages.send);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setIsSending(true);
    try {
      await sendMessage({ applicationId, content: content.trim() });
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!messages) {
    return (
      <Card className="flex flex-col h-[500px]">
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-3/4" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg: any) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs bg-muted">
                  {msg.sender?.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(msg._creationTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </CardContent>
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isSending || !content.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}