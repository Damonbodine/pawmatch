"use client";

import { NavSidebar } from "@/components/layout/NavSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <NavSidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
