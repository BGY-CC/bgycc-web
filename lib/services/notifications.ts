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
    pageSize = 10,
    userId,
    isRead = false,
  }: {
    page: number;
    pageSize?: number;
    userId?: string;
    isRead?: boolean;
  }): Promise<NotificationsApiResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      is_read: isRead.toString(),
    });

    if (userId) params.set("user_id", userId);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/notifications?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    return response.json();
  },
};
