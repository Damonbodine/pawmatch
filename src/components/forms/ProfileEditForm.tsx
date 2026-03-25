"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserProfile {
  _id: Id<"users">;
  name: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

interface ProfileEditFormProps {
  user: UserProfile;
  onSuccess?: () => void;
}

export function ProfileEditForm({ user, onSuccess }: ProfileEditFormProps) {
  const updateUser = useMutation(api.users.update);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [bio, setBio] = useState(user.bio ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser({
        userId: user._id,
        name,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-foreground">Phone (optional)</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl" className="text-foreground">Avatar URL (optional)</Label>
        <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="bg-background border-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-foreground">Bio (optional)</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="bg-background border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
