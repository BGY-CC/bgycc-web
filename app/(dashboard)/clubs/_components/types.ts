export interface Club {
  id: string;
  name: string;
  region: string;
  leader: string;
  leader_id?: string;
  leader_data?: {
    id?: string;
    full_name?: string;
  };
  members: number;
  reportRate: number;
  score: number;
  status: "Active" | "Dormant";
  whatsappLink?: string;
  description?: string;
  createdAt?: string;
}
