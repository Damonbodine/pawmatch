"use client";

export const dynamic = "force-dynamic";

import { NotificationSettingsForm } from "@/components/forms/NotificationSettingsForm";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
      <NotificationSettingsForm />
    </div>
  );
}
