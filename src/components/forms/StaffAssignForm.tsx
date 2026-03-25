"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaffAssignFormProps {
  shelterId: Id<"shelters">;
  onSuccess?: () => void;
}

export function StaffAssignForm({ shelterId, onSuccess }: StaffAssignFormProps) {
  const createAssignment = useMutation(api.staffAssignments.create);
  const staffUsers = useQuery(api.users.list, { role: "ShelterStaff" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"Manager" | "Caretaker" | "Volunteer">("Caretaker");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      await createAssignment({
        userId: userId as Id<"users">,
        shelterId,
        role,
      });
      setUserId("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to assign staff:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId" className="text-foreground">Staff Member</Label>
        <Select value={userId} onValueChange={(v: string | null) => setUserId(v ?? "")}>
          <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select a staff member" /></SelectTrigger>
          <SelectContent>
            {staffUsers?.map((user: any) => (
              <SelectItem key={user._id} value={user._id}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-foreground">Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
          <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Caretaker">Caretaker</SelectItem>
            <SelectItem value="Volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading || !userId} className="w-full">
        {loading ? "Assigning..." : "Assign Staff"}
      </Button>
    </form>
  );
}