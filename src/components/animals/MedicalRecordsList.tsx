"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MedicalRecordsListProps {
  animalId: Id<"animals">;
}

const typeColors: Record<string, string> = {
  vaccination: "bg-secondary text-secondary-foreground",
  checkup: "bg-accent text-accent-foreground",
  surgery: "bg-destructive text-destructive-foreground",
  medication: "bg-primary text-primary-foreground",
  other: "bg-muted text-muted-foreground",
};

export function MedicalRecordsList({ animalId }: MedicalRecordsListProps) {
  const records = useQuery(api.animalMedicalRecords.listByAnimal, { animalId });

  if (!records) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Records</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No medical records found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Veterinarian</TableHead>
                <TableHead>Next Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: any) => (
                <TableRow key={record._id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[record.recordType] ?? ""}>
                      {record.recordType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{record.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.veterinarian ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.nextDueDate
                      ? new Date(record.nextDueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}