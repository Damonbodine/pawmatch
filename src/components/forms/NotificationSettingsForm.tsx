"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface NotificationSettingsFormProps {
  onSuccess?: () => void;
}

export function NotificationSettingsForm({ onSuccess }: NotificationSettingsFormProps) {
  const upsertSettings = useMutation(api.userSettings.upsert);
  const currentSettings = useQuery(api.userSettings.get);
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(currentSettings?.emailNotifications ?? true);
  const [applicationUpdates, setApplicationUpdates] = useState(currentSettings?.applicationUpdates ?? true);
  const [newAnimalAlerts, setNewAnimalAlerts] = useState(currentSettings?.newAnimalAlerts ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertSettings({
        emailNotifications,
        applicationUpdates,
        newAnimalAlerts,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="emailNotifications" checked={emailNotifications} onCheckedChange={(v) => setEmailNotifications(v === true)} />
            <Label htmlFor="emailNotifications" className="text-foreground">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="applicationUpdates" checked={applicationUpdates} onCheckedChange={(v) => setApplicationUpdates(v === true)} />
            <Label htmlFor="applicationUpdates" className="text-foreground">Application updates</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="newAnimalAlerts" checked={newAnimalAlerts} onCheckedChange={(v) => setNewAnimalAlerts(v === true)} />
            <Label htmlFor="newAnimalAlerts" className="text-foreground">New animal alerts</Label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
