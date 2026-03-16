export interface Club {
  id: string;
  name: string;
  region: string;
  leader: string;
  members: number;
  reportRate: number;
  score: number;
  status: "Active" | "Dormant";
  whatsappLink?: string;
  description?: string;
  createdAt?: string;
}
