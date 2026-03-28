"use client";

import { Suspense, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DemoMode } from "@/components/demo-mode";
import { NavSidebar } from "@/components/layout/NavSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isSignedIn } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const createFromClerk = useMutation(api.users.createFromClerk);
  const creating = useRef(false);

  useEffect(() => {
    if (isSignedIn && clerkUser && convexUser === null && !creating.current) {
      creating.current = true;
      createFromClerk().finally(() => {
        creating.current = false;
      });
    }
  }, [isSignedIn, clerkUser, convexUser, createFromClerk]);

  // Show spinner while user record is being created
  if (isSignedIn && convexUser === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Suspense fallback={null}>
          <NavSidebar />
        </Suspense>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
      <Suspense fallback={null}>
        <DemoMode />
      </Suspense>
    </SidebarProvider>
  );
}
