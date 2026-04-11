export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  content: string;
  status: "pending" | "acknowledged" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  is_active: boolean;
  display_date?: string;
}
