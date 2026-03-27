"use client";

export const dynamic = "force-dynamic";

import { RoleGuard } from "@/components/RoleGuard";
import { FavoritesGrid } from "@/components/favorites/FavoritesGrid";

export default function FavoritesPage() {
  return (
    <RoleGuard allowedRoles={["Adopter"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <FavoritesGrid />
      </div>
    </RoleGuard>
  );
}
