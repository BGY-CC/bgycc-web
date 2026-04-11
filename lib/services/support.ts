export interface SupportTicket {
  id: string;
  user_id: string;
  category: "accountabilityPartner" | "technicalIssue" | "clubRelated" | "generalInquiry" | "other";
  message: string;
  status: "pending" | "acknowledged" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface SupportResponse {
  tickets: SupportTicket[];
}

export interface Quote {
  id: string;
  content: string;
  author: string | null;
  pathway_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteResponse {
  quotes: Quote[];
}
