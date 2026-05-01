"use client";

import { Bell, CheckCircle, Mail, Clock, MoreHorizontal } from "lucide-react";
import { Badge, Button, Skeleton } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { notificationsService, NotificationsResponse, AdminNotification } from "@/lib/services/notifications";
import { useToast } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationsClient() {
  const { toast } = useToast();
  const { data: rawData, isLoading, refetch } = useQuery<any>("/notifications/me");

  // Handle various response shapes
  const response: NotificationsResponse | undefined = rawData?.data || rawData;
  const notifications = response?.notifications || [];
  const unreadCount = response?.unread_count || 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      const result = await notificationsService.markAsRead(id);
      if (result.success) {
        refetch();
      } else {
        toast(result.error || "Failed to mark notification as read", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationsService.markAllAsRead();
      if (result.success) {
        refetch();
        toast("All notifications marked as read");
      } else {
        toast(result.error || "Failed to mark all as read", "error");
      }
    } catch (error: any) {
      toast(error.message || "An error occurred", "error");
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications Header */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Inbox
              </h2>
              <p className="text-sm font-normal text-slate-500">
                You have {unreadCount} unread notifications
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              leftIcon={<CheckCircle className="h-4 w-4" />}
              onClick={handleMarkAllAsRead}
              className="shrink-0 border-gray-200 text-slate-600 hover:bg-slate-50 rounded-xl py-6 px-6"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "group relative bg-white border rounded-2xl p-6 shadow-sm transition-all",
                notif.is_read ? "border-gray-100 opacity-80" : "border-indigo-100 bg-indigo-50/10 ring-1 ring-indigo-50"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon based on type */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm",
                  notif.is_read 
                    ? "bg-slate-50 border-slate-100 text-slate-400" 
                    : "bg-white border-indigo-100 text-indigo-600"
                )}>
                  {notif.type === "support_ticket_created" ? <Mail className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                      "text-[15px] font-semibold truncate",
                      notif.is_read ? "text-slate-600" : "text-slate-900"
                    )}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <Badge variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none text-[10px] uppercase font-bold py-0.5 px-2">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-sm leading-relaxed mb-3",
                    notif.is_read ? "text-slate-500" : "text-slate-600"
                  )}>
                    {notif.body}
                  </p>

                  <div className="flex items-center gap-4 text-[12px] font-medium text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </div>
                    {notif.type && (
                      <div className="flex items-center gap-1.5 uppercase tracking-wider opacity-70">
                        • {notif.type.replace(/_/g, " ")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="shrink-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300 mx-auto mb-6">
              <Bell className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              When you have updates or alerts, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
