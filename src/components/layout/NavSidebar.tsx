"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Home, PawPrint, FileText, Heart, Bell, Building2, Settings, Users, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badgeCount?: number;
}

export function NavSidebar() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const currentUser = useQuery(api.users.getCurrentUser);
  const pathname = usePathname();

  const role = currentUser?.role ?? "adopter";

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Animals", href: "/animals", icon: PawPrint },
    { label: "My Applications", href: "/my-applications", icon: FileText, roles: ["Adopter"] },
    { label: "Review Applications", href: "/review-applications", icon: FileText, roles: ["Admin", "ShelterStaff"] },
    { label: "Favorites", href: "/favorites", icon: Heart, roles: ["Adopter"] },
    { label: "Shelters", href: "/shelters", icon: Building2, roles: ["Admin", "ShelterStaff"] },
    { label: "Users", href: "/users", icon: Users, roles: ["Admin"] },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground">PawMatch</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                    {item.badgeCount}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={clerkUser?.imageUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {clerkUser?.firstName?.[0]}{clerkUser?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {clerkUser?.fullName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}