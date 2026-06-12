"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";
import {
  AdminNotification,
  notificationsService,
} from "@/lib/services/notifications";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getInitials(name?: string) {
  if (!name) return "N";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const hasMore = page < totalPages;
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount.toString();

  const loadPage = useCallback(async (nextPage: number, replace = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await notificationsService.list({
        page: nextPage,
        pageSize: PAGE_SIZE,
        isRead: false,
      });
      const data = result.data;

      if (!data) return;

      setUnreadCount(data.unread_count ?? 0);
      setPage(data.meta?.page ?? nextPage);
      setTotalPages(data.meta?.total_pages || 1);
      setNotifications((current) =>
        replace ? data.notifications : [...current, ...data.notifications],
      );
      setHasLoaded(true);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node || !hasMore || loadingRef.current) return;

    const distanceToBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;

    if (distanceToBottom < 96) {
      loadPage(page + 1);
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-11 w-11 rounded-xl text-muted hover:bg-background hover:text-primary"
        aria-label={
          unreadCount > 0
            ? `${unreadLabel} unread notifications`
            : "Notifications"
        }
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-error px-1 text-[10px] font-semibold leading-none text-white">
            {unreadLabel}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[120] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-primary">Notifications</p>
            <p className="text-xs text-muted">{unreadCount} unread</p>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[min(28rem,calc(100dvh-8rem))] overflow-y-auto overscroll-contain"
          >
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-xs font-semibold text-primary">
                    {notification.user?.profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={notification.user.profile_picture_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(notification.user?.full_name)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-primary">
                        {notification.title}
                      </p>
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-error" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-subtle">
                      {notification.body}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="truncate text-[11px] text-muted">
                        {notification.user?.full_name || notification.type}
                      </p>
                      <p className="shrink-0 text-[11px] text-muted">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="space-y-3 px-4 py-3">
                {Array.from({ length: hasLoaded ? 1 : 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted">
                No unread notifications.
              </div>
            )}

            {!isLoading && notifications.length > 0 && !hasMore && (
              <div className="px-4 py-3 text-center text-xs text-muted">
                End of notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
