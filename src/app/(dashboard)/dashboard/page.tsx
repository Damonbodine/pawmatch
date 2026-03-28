"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { DemoModeStartButton } from "@/components/demo-mode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PawPrint, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

function DashboardPageContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const searchParams = useSearchParams();

  // Loading state
  if (currentUser === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // User record not yet created
  if (currentUser === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-lg">Setting up your account...</p>
      </div>
    );
  }

  // Admin dashboard
  if (currentUser.role === "Admin") {
    return (
      <div className="space-y-6" data-demo="dashboard-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <DemoModeStartButton />
        </div>
        <div data-demo="dashboard-overview">
          <DashboardStatCards />
        </div>
      </div>
    );
  }

  // Shelter Staff dashboard
  if (currentUser.role === "ShelterStaff") {
    return (
      <div className="space-y-6" data-demo="dashboard-overview">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}!</p>
          </div>
          <DemoModeStartButton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href={withPreservedDemoQuery("/review-applications", searchParams)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-demo="pending-applications">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Review Applications</h3>
                    <p className="text-sm text-muted-foreground">Review pending adoption applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={withPreservedDemoQuery("/animals", searchParams)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PawPrint className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Manage Animals</h3>
                    <p className="text-sm text-muted-foreground">View and manage shelter animals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={withPreservedDemoQuery("/shelters", searchParams)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">My Shelter</h3>
                    <p className="text-sm text-muted-foreground">View shelter details and staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // Adopter dashboard (default)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser.name}!</h1>
          <p className="text-muted-foreground">Find your perfect companion today.</p>
        </div>
        <DemoModeStartButton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href={withPreservedDemoQuery("/animals", searchParams)}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PawPrint className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Browse Animals</h3>
                  <p className="text-sm text-muted-foreground">Find adoptable pets near you</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={withPreservedDemoQuery("/my-applications", searchParams)}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">My Applications</h3>
                  <p className="text-sm text-muted-foreground">Track your adoption applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-24" />}>
      <DashboardPageContent />
    </Suspense>
  );
}
