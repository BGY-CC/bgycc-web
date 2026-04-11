export interface Resource {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  xp_reward: number;
  is_active: boolean;
  min_rank_required: string | null;
  min_streak_required: number;
  pathway: "leadership" | "public_speaking" | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceResponse {
  resources: Resource[];
}
