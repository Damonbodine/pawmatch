"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function SettingsForm() {
  const settings = useQuery(api.userSettings.get);
  const upsertSettings = useMutation(api.userSettings.upsert);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [newAnimalAlerts, setNewAnimalAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications ?? true);
      setApplicationUpdates(settings.applicationUpdates ?? true);
      setNewAnimalAlerts(settings.newAnimalAlerts ?? true);
    }
  }, [settings]);

  if (settings === undefined) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await upsertSettings({ emailNotifications, applicationUpdates, newAnimalAlerts });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Notifications</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Application Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about application status changes</p>
            </div>
            <Switch checked={applicationUpdates} onCheckedChange={setApplicationUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>New Animal Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when new animals are added</p>
            </div>
            <Switch checked={newAnimalAlerts} onCheckedChange={setNewAnimalAlerts} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          {saved && <span className="text-sm text-secondary">Settings saved!</span>}
        </div>
      </CardContent>
    </Card>
  );
}
