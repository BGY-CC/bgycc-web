import { describe, it, expect, vi, beforeEach } from "vitest";
import { curriculumService } from "@/lib/services/curriculum";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-curriculum";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("curriculumService.list", () => {
  it("calls GET /curriculum", async () => {
    const fetchMock = mockFetch({ items: [] });
    vi.stubGlobal("fetch", fetchMock);

    await curriculumService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/curriculum`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("curriculumService.create", () => {
  it("sends POST /curriculum with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = {
      pathway_slug: "leadership" as const,
      day_number: 1,
      title: "Day 1",
      media_url: "https://example.com/video.mp4",
      media_type: "video" as const,
    };
    await curriculumService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/curriculum`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("curriculumService.update", () => {
  it("sends PATCH /curriculum/:id with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await curriculumService.update("curr-1", { title: "Updated Day" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/curriculum/curr-1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Day" }),
      })
    );
  });
});

describe("curriculumService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await curriculumService.delete("curr-del");
    expect(result).toEqual({ success: true });
  });

  it("returns { success: true } on 200", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await curriculumService.delete("curr-del");
    expect(result).toEqual({ success: true });
  });

  it("falls back gracefully on non-JSON error response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("Not JSON")),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await curriculumService.delete("curr-bad");
    expect(result).toEqual({ success: false });
  });
});
