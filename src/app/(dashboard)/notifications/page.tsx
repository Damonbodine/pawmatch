"use client";

import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
