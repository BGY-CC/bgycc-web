import { describe, it, expect, vi, beforeEach } from "vitest";
import { resourcesService } from "@/lib/services/resources";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-resources-versions";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("resourcesService.listVersions", () => {
  it("calls GET /resources/:id/versions", async () => {
    const fetchMock = mockFetch({ success: true, data: { versions: [] } });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.listVersions("res-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/res-1/versions`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("resourcesService.rollback", () => {
  it("POSTs /resources/:id/rollback with the target version", async () => {
    const fetchMock = mockFetch({ success: true, data: { resource: {} } });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.rollback("res-1", 3);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/res-1/rollback`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ version: 3 }),
      })
    );
  });
});

describe("resourcesService.categories", () => {
  it("calls GET /resources/categories", async () => {
    const fetchMock = mockFetch({ success: true, data: { categories: [] } });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.categories();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/categories`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("resourcesService.completions", () => {
  it("calls GET /resources/completions", async () => {
    const fetchMock = mockFetch({ success: true, data: { completions: [] } });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.completions();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/completions`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("resourcesService.exportCompletionsCsv", () => {
  it("calls GET /resources/export/completions and returns the CSV text", async () => {
    const csv = "resource_id,title,category,completions\nres-1,Audit Guide,toolkit,3";
    const fetchMock = mockFetch(csv);
    vi.stubGlobal("fetch", fetchMock);

    const result = await resourcesService.exportCompletionsCsv();

    expect(result).toBe(csv);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/export/completions`,
      expect.objectContaining({ method: "GET" })
    );
  });
});