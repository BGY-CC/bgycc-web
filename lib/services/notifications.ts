import { API_CONFIG } from "../api";

export interface NotificationUser {
  id: string;
  full_name: string;
  email: string;
  profile_picture_url: string | null;
}

export interface AdminNotification {
  id: string;
  user_id: string;
  type: string;
  slug: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  user?: NotificationUser;
}

export interface NotificationsResponse {
  notifications: AdminNotification[];
  unread_count: number;
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

interface NotificationsApiResponse {
  success: boolean;
  data?: NotificationsResponse;
  error?: string;
  message?: string;
}

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const notificationsService = {
  list: async ({
    page,
    pageSize = 20,
    userId,
    type,
    isRead,
  }: {
    page: number;
    pageSize?: number;
    userId?: string;
    type?: string;
    isRead?: boolean | "true" | "false";
  }): Promise<NotificationsApiResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (userId) params.set("user_id", userId);
    if (type) params.set("type", type);
    if (isRead !== undefined) params.set("is_read", isRead.toString());

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/notifications?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    return response.json();
  },

  listMe: async ({
    page,
    pageSize = 20,
    type,
    isRead,
  }: {
    page: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean | "true" | "false";
  }): Promise<NotificationsApiResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (type) params.set("type", type);
    if (isRead !== undefined) params.set("is_read", isRead.toString());

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/notifications/me?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    return response.json();
  },

  markAsRead: async (id: string): Promise<NotificationsApiResponse> => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );

    return response.json();
  },

  markAllAsRead: async (): Promise<NotificationsApiResponse> => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/notifications/read-all`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );

    return response.json();
  },
};
