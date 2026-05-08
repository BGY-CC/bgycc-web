import { API_CONFIG, readJson } from "../api";

export type SearchResultType =
  | "user"
  | "club"
  | "resource"
  | "announcement"
  | "pathway"
  | "checklist";

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface SearchPayload {
  query: string;
  results: SearchResultItem[];
  counts: Partial<Record<SearchResultType, number>>;
  took_ms: number;
}

export interface SearchResponse {
  success?: boolean;
  data?: SearchPayload;
  error?: string;
  message?: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("bgycc-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface SearchParams {
  q: string;
  types?: SearchResultType[];
  limit?: number;
  signal?: AbortSignal;
}

export const searchService = {
  search: async ({ q, types, limit, signal }: SearchParams): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.set("q", q);
    if (types && types.length > 0) params.set("types", types.join(","));
    if (typeof limit === "number") params.set("limit", String(limit));

    const response = await fetch(`${API_CONFIG.BASE_URL}/search?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
      signal,
    });
    return readJson<SearchResponse>(response);
  },
};
