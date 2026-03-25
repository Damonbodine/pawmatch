"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function SheltersTable() {
  const shelters = useQuery(api.shelters.list, {});

  if (!shelters) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (shelters.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No shelters found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shelters.map((shelter: any) => {
          const occupancy = shelter.currentOccupancy ?? 0;
          const capacity = shelter.capacity ?? 1;
          const pct = Math.min(100, Math.round((occupancy / capacity) * 100));
          return (
            <TableRow key={shelter._id}>
              <TableCell className="font-medium text-foreground">{shelter.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {shelter.city}, {shelter.state}
              </TableCell>
              <TableCell className="text-muted-foreground">{shelter.phone}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {occupancy}/{capacity}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={shelter.isActive ? "default" : "secondary"}>
                  {shelter.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/shelters/${shelter._id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>View</Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}