import { describe, it, expect, vi, beforeEach } from "vitest";
import { checklistService } from "@/lib/services/checklist";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-checklist";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("checklistService.list", () => {
  it("calls GET /checklist with auth header", async () => {
    const fetchMock = mockFetch({ items: [] });
    vi.stubGlobal("fetch", fetchMock);

    await checklistService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/checklist`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });
});

describe("checklistService.create", () => {
  it("sends POST /checklist with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { name: "New Task", pathway: "leadership" as const, xp_value: 10 };
    await checklistService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/checklist`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("checklistService.update", () => {
  it("sends PATCH /checklist/:slug with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const slug = "my-task";
    const data = { xp_value: 20 };
    await checklistService.update(slug, data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/checklist/${slug}`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("checklistService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await checklistService.delete("task-slug");
    expect(result).toEqual({ success: true });
  });

  it("returns { success: true } on 200", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await checklistService.delete("task-slug");
    expect(result).toEqual({ success: true });
  });

  it("trims slug whitespace", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await checklistService.delete("  task-trim  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("task-trim");
    expect(calledUrl).not.toMatch(/\s/);
  });
});
