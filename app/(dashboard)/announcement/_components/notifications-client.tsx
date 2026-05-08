"use client";

import { useState, useMemo } from "react";
import { Bell, CheckCircle, Mail, Clock, Search, Filter, X } from "lucide-react";
import { Badge, Button, Skeleton, Input, Select, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { useQuery } from "@/hooks/use-query";
import { notificationsService, NotificationsResponse } from "@/lib/services/notifications";
import { useToast } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "support_ticket_created", label: "Support Ticket" },
  { value: "announcement", label: "Announcement" },
  { value: "member_joined", label: "Member Joined" },
  { value: "club_created", label: "Club Created" },
];

export function NotificationsClient() {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";

  const [filters, setFilters] = useState({
    status: "all", // "all", "unread", "read"
    type: "all",
    userId: "",
  });

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filters.status === "unread") params.set("is_read", "false");
    else if (filters.status === "read") params.set("is_read", "true");
    
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.userId) params.set("user_id", filters.userId);
    
    // Use admin endpoint if userId is set, otherwise use "me" endpoint
    const base = filters.userId ? "/notifications" : "/notifications/me";
    return `${base}?${params.toString()}`;
  }, [filters]);

  const { data: rawData, isLoading, refetch } = useQuery<any>(endpoint);

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

  const clearFilters = () => {
    setFilters({
      status: "all",
      type: "all",
      userId: "",
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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

          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleMarkAllAsRead}
                className="shrink-0 border-gray-200 text-slate-600 hover:bg-slate-50 rounded-xl py-2 px-4 h-10"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mt-8 pt-8 border-t border-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Tabs 
                value={filters.status} 
                onValueChange={(val) => setFilters(f => ({ ...f, status: val }))}
              >
                <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                  <TabsTrigger value="all" className="rounded-lg px-4 py-1.5 text-[11px] bg-transparent data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">All</TabsTrigger>
                  <TabsTrigger value="unread" className="rounded-lg px-4 py-1.5 text-[11px] bg-transparent data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Unread</TabsTrigger>
                  <TabsTrigger value="read" className="rounded-lg px-4 py-1.5 text-[11px] bg-transparent data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Read</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="w-[160px] h-9 text-xs rounded-xl"
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </div>

              {isAdmin && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search by User ID..."
                    value={filters.userId}
                    onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                    className="pl-9 w-[220px] h-9 text-xs rounded-xl border-gray-200"
                  />
                </div>
              )}
            </div>

            {(filters.status !== "all" || filters.type !== "all" || filters.userId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="h-3.5 w-3.5" />}
                className="text-slate-500 hover:text-slate-700 h-9 px-3 rounded-xl text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : notifications.length > 0 ? (
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
                      {new Date(notif.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {notif.type && (
                      <div className="flex items-center gap-1.5 uppercase tracking-wider opacity-70">
                        • {notif.type.replace(/_/g, " ")}
                      </div>
                    )}
                    {isAdmin && notif.user && (
                      <div className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                        • {notif.user.full_name}
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Try adjusting your filters to find what you're looking for.
            </p>
            {(filters.status !== "all" || filters.type !== "all" || filters.userId) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-6 rounded-xl border-gray-200"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
