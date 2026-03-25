"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PawPrint, FileText, Building2, Users } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStatCards() {
  const stats = useQuery(api.dashboard.adminStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Animals"
        value={stats.totalAnimals}
        icon={PawPrint}
        description={`${stats.animalsByStatus.available} available`}
      />
      <StatCard
        label="Applications"
        value={stats.totalApplications}
        icon={FileText}
        description={`${stats.applicationsByStatus.submitted + stats.applicationsByStatus.underReview} pending`}
      />
      <StatCard
        label="Shelters"
        value={stats.totalShelters}
        icon={Building2}
      />
      <StatCard
        label="Users"
        value={stats.totalUsers}
        icon={Users}
      />
    </div>
  );
}