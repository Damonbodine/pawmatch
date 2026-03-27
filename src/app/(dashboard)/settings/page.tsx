"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/settings/profile">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your name, email, phone, and bio.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/notifications">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure email alerts and notification preferences.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
