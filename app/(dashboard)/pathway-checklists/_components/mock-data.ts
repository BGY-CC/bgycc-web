import type { ChecklistItem } from "./types";

export const LEADERSHIP_ITEMS: ChecklistItem[] = [
  { id: "l1", title: "Morning Prayer", type: "Prayer", description: "Start your day with dedicated prayer time focused on leadership growth.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "l2", title: "Bible Study — Leadership Principles", type: "Bible Study", description: "Study a chapter focused on biblical leadership principles.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "l3", title: "Guided Meditation", type: "Meditation", description: "10 minutes of focused meditation on your leadership vision.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "l4", title: "Leadership Journal", type: "Journaling", description: "Study a chapter focused on biblical leadership principles.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "l5", title: "Daily Audio Report", type: "Audio Report", description: "Submit your end-of-day audio report summarizing progress.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "l6", title: "Mentor Check-in", type: "Mentor Session", description: "Weekly session with your assigned mentor to discuss growth.", schedule: "Weekly", days: "Wednesdays" },
  { id: "l7", title: "Lead a Team Activity", type: "Leadership Exercise", description: "Organize and lead a group activity within your club.", schedule: "Weekly", days: "Fridays" },
];

export const PUBLIC_SPEAKING_ITEMS: ChecklistItem[] = [
  { id: "p1", title: "Morning Prayer", type: "Prayer", description: "Start your day with dedicated prayer time.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "p2", title: "Speaker Affirmations", type: "Affirmations", description: "Recite daily affirmations for public speaking confidence.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "p3", title: "2-Minute Impromptu Speech", type: "Practice Speech", description: "Practice delivering a short speech on a random topic.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "p4", title: "Daily Audio Report", type: "Audio Report", description: "Submit your end-of-day audio report summarizing progress.", schedule: "Everyday", days: "Mon - Sun" },
  { id: "p5", title: "Watch: The Art of Storytelling", type: "Watch Video", description: "Weekly session with your assigned mentor to discuss growth.", schedule: "Weekly", days: "Wednesdays" },
  { id: "p6", title: "Watch: Body Language Masterclass", type: "Watch Video", description: "Learn essential body language techniques for powerful delivery.", schedule: "Specific Day", cycleDay: "Cycle 1, Day 5" },
];
