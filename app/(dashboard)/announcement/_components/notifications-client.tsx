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

  const { data: rawData, isLoading, refetch } = useQuery<unknown>(endpoint);

  // Handle various response shapes
  const wrapped = rawData as { data?: NotificationsResponse } | NotificationsResponse | null | undefined;
  const response: NotificationsResponse | undefined =
    (wrapped && "data" in wrapped ? wrapped.data : (wrapped as NotificationsResponse | undefined)) ?? undefined;
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
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
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
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "An error occurred", "error");
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
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Bell className="h-6 w-6" />
            </div>
            <div className="min-w-0">
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
                className="min-h-11 w-full shrink-0 rounded-xl border-gray-200 px-4 py-2 text-slate-600 hover:bg-slate-50 sm:w-auto"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mt-8 border-t border-gray-50 pt-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
              <Tabs
                className="w-full sm:w-auto"
                value={filters.status} 
                onValueChange={(val) => setFilters(f => ({ ...f, status: val }))}
              >
                <TabsList className="flex w-full flex-wrap justify-start rounded-xl bg-slate-100/80 p-1 sm:w-auto">
                  <TabsTrigger value="all" className="min-h-11 flex-1 rounded-lg bg-transparent px-4 py-1.5 text-[11px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm sm:flex-none">All</TabsTrigger>
                  <TabsTrigger value="unread" className="min-h-11 flex-1 rounded-lg bg-transparent px-4 py-1.5 text-[11px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm sm:flex-none">Unread</TabsTrigger>
                  <TabsTrigger value="read" className="min-h-11 flex-1 rounded-lg bg-transparent px-4 py-1.5 text-[11px] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm sm:flex-none">Read</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                  className="h-11 w-full rounded-xl text-xs sm:w-[180px]"
                >
                  {NOTIFICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </div>

              {isAdmin && (
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search by User ID..."
                    value={filters.userId}
                    onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                    className="h-11 w-full rounded-xl border-gray-200 pl-9 text-xs sm:w-[260px]"
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
                className="min-h-11 w-full rounded-xl px-3 text-xs text-slate-500 hover:text-slate-700 sm:w-auto"
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
                "group relative rounded-2xl border bg-white p-4 shadow-sm transition-all sm:p-6",
                notif.is_read ? "border-gray-100 opacity-80" : "border-indigo-100 bg-indigo-50/10 ring-1 ring-indigo-50"
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
                  <div className="mb-2 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
                    <h3 className={cn(
                      "text-[15px] font-semibold break-words",
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
                    "mb-3 break-words text-sm leading-relaxed",
                    notif.is_read ? "text-slate-500" : "text-slate-600"
                  )}>
                    {notif.body}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-slate-400">
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
                        {notif.type.replace(/_/g, " ")}
                      </div>
                    )}
                    {isAdmin && notif.user && (
                      <div className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                        {notif.user.full_name}
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
                    className="min-h-11 w-full shrink-0 self-stretch font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto sm:self-start"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300 mx-auto mb-6">
              <Bell className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Try adjusting your filters to find what you&apos;re looking for.
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
