export interface Announcement {
  id: string;
  club_id: string | null;
  title: string;
  content: string | null;
  type: "announcement" | "event";
  image_url: string | null;
  link_url: string | null;
  author_id: string | null;
  event_topic?: string | null;
  event_sub_topic?: string | null;
  event_date: string | null;
  event_time?: string | null;
  event_location: string | null;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
}
