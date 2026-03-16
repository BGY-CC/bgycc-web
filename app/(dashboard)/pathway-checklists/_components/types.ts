export type Schedule = "Everyday" | "Weekly" | "Specific Day";
export type TaskType =
  | "Prayer"
  | "Bible Study"
  | "Meditation"
  | "Journaling"
  | "Audio Report"
  | "Mentor Session"
  | "Leadership Exercise"
  | "Affirmations"
  | "Practice Speech"
  | "Watch Video";

export type Pathway = "leadership" | "public-speaking";

export interface ChecklistItem {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  schedule: Schedule;
  days?: string; // e.g. "Mon - Sun", "Wednesdays"
  cycleDay?: string; // e.g. "Cycle 1, Day 5"
}
