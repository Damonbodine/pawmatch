"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";

interface NotificationsListProps {
  unreadOnly?: boolean;
}

export function NotificationsList({ unreadOnly }: NotificationsListProps) {
  const notifications = useQuery(api.notifications.listByUser, {
    unreadOnly: unreadOnly ?? false,
  });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  if (!notifications) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Bell className="h-12 w-12 mb-3" />
        <p>No notifications yet.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((notification: any) => (
          <Card
            key={notification._id}
            className={`transition-colors ${
              notification.isRead ? "bg-card" : "bg-accent/30 border-primary/20"
            }`}
          >
            <CardContent className="flex items-start gap-3 py-3 px-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm">{notification.title}</p>
                  {!notification.isRead && (
                    <Badge variant="default" className="text-xs px-1.5">New</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification._creationTime).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {notification.link && (
                  <Link href={notification.link} className={buttonVariants({ variant: "ghost", size: "sm" })}>View</Link>
                )}
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markRead({ notificationId: notification._id })}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}