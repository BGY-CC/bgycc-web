import type { Club } from "./types";

export const MOCK_CLUBS: Club[] = [
  { id: "1", name: "Benin Club", region: "Edo, Benin City", leader: "Sarah Adekunle", members: 45, reportRate: 22, score: 30, status: "Dormant", createdAt: "8/22/2023" },
  { id: "2", name: "Ibadan Club", region: "Oyo, Ibadan", leader: "Samuel Eze", members: 198, reportRate: 92, score: 96, status: "Active" },
  { id: "3", name: "Jos Club", region: "Plateau, Jos", leader: "Elijah Musa", members: 112, reportRate: 85, score: 88, status: "Active" },
  { id: "4", name: "Kano Club", region: "Kano, Kano", leader: "Daniel Okoro", members: 156, reportRate: 82, score: 79, status: "Active" },
  { id: "5", name: "Lagos Club", region: "Lagos, Ikeja", leader: "John Adewale", members: 245, reportRate: 87, score: 94, status: "Active" },
  { id: "6", name: "Minna Club", region: "Niger, Minna", leader: "Mercy Bello", members: 89, reportRate: 68, score: 65, status: "Active" },
  { id: "7", name: "Onitsha Club", region: "Anambra, Onitsha", leader: "Faith Nwosu", members: 132, reportRate: 71, score: 74, status: "Active" },
  { id: "8", name: "Warri Club", region: "Delta, Warri", leader: "Grace Obi", members: 180, reportRate: 78, score: 82, status: "Active" },
];

export const MOCK_STATS = {
  totalClubs: 8,
  activeClubs: 7,
  totalMembers: 1157,
  avgScore: 76,
};
