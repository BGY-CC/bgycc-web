export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "announcement" | "event";
  image_url?: string;
  link_url?: string;
  event_date?: string;
  event_location?: string;
  is_active: boolean;
  created_at?: string;
}

export interface PaginatedAnnouncements {
  items: Announcement[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
