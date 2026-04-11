export interface ChecklistItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  pathway: string;
  xp_value: number;
  is_active: boolean;
}

export interface CurriculumItem {
  id: string;
  pathway_slug: string;
  day_number: number;
  title: string;
  description: string;
  media_url?: string;
  media_type?: string;
}
