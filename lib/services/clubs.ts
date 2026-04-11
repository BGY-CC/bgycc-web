export interface Club {
  id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  url_link?: string;
  is_active: boolean;
  total_members: number;
  active_members: number;
  average_streak: number;
  leader_name?: string; // from primary leader info
  created_at?: string;
  // UI legacy compatibility
  region?: string; 
  status?: "Active" | "Dormant";
}

export interface ClubMemberHealth {
  active: number;
  at_risk: number;
  reset: number;
}

export interface ClubStats {
  stats: {
    total_clubs: number;
    active_clubs: number;
    total_members: number;
    avg_club_score: number;
  }
}

export interface PaginatedClubs {
  clubs: Club[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
