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
    /^step,started,completed,drop_rate$/i.test(row.trim())
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
      { method: "GET", headers: getAuthHeaders() }
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
      { method: "GET", headers: getAuthHeaders() }
    );
    if (!response.ok) {
      throw new Error(`Funnel export failed (${response.status})`);
    }
    const csv = await response.text();
    return { csv, rows: parseFunnelCsv(csv) };
  },
};
