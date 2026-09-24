import { API_CONFIG } from "../api";

export interface FunnelRow {
  step: string;
  started: number;
  completed: number;
  dropRate: number;
}

export interface FunnelCsvData {
  csv: string;
  rows: FunnelRow[];
}

export interface FunnelQueryParams {
  clubId?: string;
  region?: string;
  role?: string;
}

export interface EscalationRuleSummary {
  rule_id: string;
  rule: string;
  severity: string;
  count: number;
}

export interface EscalationTrendEntry {
  date: string;
  total: number;
}

export interface EscalationLogEntry {
  id: string;
  user_id: string;
  rule: string;
  severity: string;
  escalated_on: string;
  full_name: string | null;
  email: string | null;
}

export interface EscalationData {
  summary: {
    total: number;
    by_severity: { yellow: number; red: number };
    by_rule: EscalationRuleSummary[];
  };
  trend: EscalationTrendEntry[];
  logs: EscalationLogEntry[];
}

export interface PredictiveAtRiskMember {
  user_id: string;
  full_name: string | null;
  email: string | null;
  missed_days: number;
  current_streak: number | null;
  leadership_missed_days: number;
  speaking_missed_days: number;
  projected_red_in_days: number | null;
}

export interface FaithfulParentSignal {
  id: string;
  full_name: string | null;
  username: string | null;
  child_count: number;
  consistent_child_count: number;
  min_child_streak: number;
  is_eligible: boolean;
}

export interface AwardFaithfulParentResult {
  awarded: boolean;
  message: string;
  signal?: {
    child_count: number;
    consistent_child_count: number;
    min_child_streak: number;
  };
}

export interface PredictiveAtRiskData {
  horizon: number;
  members: PredictiveAtRiskMember[];
}

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
};

const parseFunnelCsv = (csv: string): FunnelRow[] => {
  const rows = csv
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean);

  const headerIndex = rows.findIndex((row) =>
    /^step,started,completed,drop_rate$/i.test(row.trim()),
  );
  if (headerIndex === -1) return [];

  return rows
    .slice(headerIndex + 1)
    .map((line) => {
      const [step, started, completed, dropRate] = parseCsvLine(line);
      return {
        step: step ?? "",
        started: Number(started ?? 0),
        completed: Number(completed ?? 0),
        dropRate: Number(dropRate ?? 0),
      };
    })
    .filter((r) => r.step !== "");
};

export const analyticsService = {
  exportCsv: async (period: string = "month") => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/export?period=${period}&format=csv`,
      { method: "GET", headers: getAuthHeaders() },
    );
    if (!response.ok) {
      throw new Error(`Analytics export failed (${response.status})`);
    }
    return response.text();
  },

  getFunnelCsv: async (params?: FunnelQueryParams): Promise<FunnelCsvData> => {
    const query = new URLSearchParams();
    if (params?.clubId?.trim()) query.set("clubId", params.clubId.trim());
    if (params?.region?.trim()) query.set("region", params.region.trim());
    if (params?.role?.trim()) query.set("role", params.role.trim());
    const queryString = query.toString();
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/funnel?format=csv${queryString ? `&${queryString}` : ""}`,
      { method: "GET", headers: getAuthHeaders() },
    );
    if (!response.ok) {
      throw new Error(`Funnel export failed (${response.status})`);
    }
    const csv = await response.text();
    return { csv, rows: parseFunnelCsv(csv) };
  },

  getEscalations: async (days: number = 30) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/escalations?days=${days}`,
      { method: "GET", headers: getAuthHeaders() },
    );
    if (!response.ok) {
      throw new Error(`Escalations fetch failed (${response.status})`);
    }
    const body = await response.json();
    return body?.data ?? body;
  },

  getPredictiveAtRisk: async (horizon: number = 7) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/predictive-at-risk?horizon=${horizon}`,
      { method: "GET", headers: getAuthHeaders() },
    );
    if (!response.ok) {
      throw new Error(`Predictive at-risk fetch failed (${response.status})`);
    }
    const body = await response.json();
    return body?.data ?? body;
  },

  getFaithfulParents: async () => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/faithful-parents`,
      { method: "GET", headers: getAuthHeaders() },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(
        (body as { error?: string; message?: string })?.error ??
          (body as { message?: string })?.message ??
          `Faithful parents fetch failed (${response.status})`,
      );
    }
    return (body?.data ?? body) as { parents: FaithfulParentSignal[] };
  },

  awardFaithfulParent: async (parentId: string) => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics/faithful-parents/${parentId}/award`,
      { method: "POST", headers: getAuthHeaders() },
    );
    const body = await response.json();
    if (!response.ok) {
      throw new Error(
        (body as { error?: string; message?: string })?.error ??
          (body as { message?: string })?.message ??
          `Faithful parent award failed (${response.status})`,
      );
    }
    return (body?.data ?? body) as AwardFaithfulParentResult;
  },
};
