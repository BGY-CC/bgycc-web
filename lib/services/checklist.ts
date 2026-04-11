export interface ChecklistItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pathway: "leadership" | "public_speaking" | "both";
  xp_value: number;
  day_of_week: number | null;
  day_number: number | null;
  cycle_number: number | null;
  resource_title: string | null;
  resource_url: string | null;
  is_active: boolean;
  is_curriculum_based: boolean;
  metadata?: any;
}

export interface CurriculumItem {
  id: string;
  pathway_slug: "leadership" | "public_speaking";
  day_number: number;
  title: string;
  description: string | null;
  media_url: string;
  media_type: "video" | "audio" | "image" | "text";
  xp_value?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}
