"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfileEditForm } from "@/components/forms/ProfileEditForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettingsPage() {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
      {currentUser === undefined ? (
        <Skeleton className="h-64 w-full" />
      ) : currentUser === null ? (
        <p className="text-muted-foreground">Please sign in to edit your profile.</p>
      ) : (
        <ProfileEditForm user={currentUser} />
      )}
    </div>
  );
}
