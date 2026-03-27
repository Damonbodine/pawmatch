"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RoleGuard } from "@/components/RoleGuard";
import { MessageThread } from "@/components/messages/MessageThread";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const currentUser = useQuery(api.users.getCurrentUser);
  const application = useQuery(api.applications.getById, { applicationId: id as Id<"applications"> });

  return (
    <RoleGuard allowedRoles={["ShelterStaff", "Admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        {currentUser && application ? (
          <MessageThread
            applicationId={id as Id<"applications">}
            recipientId={application.applicantId}
            currentUserId={currentUser._id}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </div>
    </RoleGuard>
  );
}
