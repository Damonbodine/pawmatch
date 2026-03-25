"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileForm() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateUser = useMutation(api.users.update);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? "");
      setPhone(currentUser.phone ?? "");
      setBio(currentUser.bio ?? "");
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    try {
      await updateUser({
        userId: currentUser._id,
        name: name || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{currentUser.email}</p>
              <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {saved && <span className="text-sm text-secondary">Saved successfully!</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
