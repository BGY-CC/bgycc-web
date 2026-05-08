import { describe, it, expect, vi, beforeEach } from "vitest";
import { pathwaysService } from "@/lib/services/pathways";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-pathways";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("pathwaysService.list", () => {
  it("calls GET /pathways", async () => {
    const fetchMock = mockFetch({ pathways: [] });
    vi.stubGlobal("fetch", fetchMock);

    await pathwaysService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/pathways`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("pathwaysService.create", () => {
  it("sends POST with pathway data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { label: "Leadership", slug: "leadership" };
    await pathwaysService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/pathways`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("pathwaysService.getDetails", () => {
  it("calls GET /pathways/:slug", async () => {
    const fetchMock = mockFetch({ id: "path-1", slug: "leadership" });
    vi.stubGlobal("fetch", fetchMock);

    await pathwaysService.getDetails("leadership");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/pathways/leadership`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("pathwaysService.update", () => {
  it("sends PUT /pathways/:slug with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { display_name: "Leadership Path" };
    await pathwaysService.update("leadership", data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/pathways/leadership`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("pathwaysService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await pathwaysService.delete("leadership");
    expect(result).toEqual({ success: true });
  });

  it("returns { success: true } on 200", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await pathwaysService.delete("leadership");
    expect(result).toEqual({ success: true });
  });

  it("trims slug whitespace", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await pathwaysService.delete("  leadership  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("leadership");
    expect(calledUrl).not.toMatch(/\s/);
  });
});

describe("pathwaysService.saveVideo", () => {
  it("sends PUT /pathways/:slug/video with file_key", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await pathwaysService.saveVideo("leadership", "r2/path/to/video.mp4");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/pathways/leadership/video`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ file_key: "r2/path/to/video.mp4" }),
      })
    );
  });
});

describe("pathwaysService.uploadVideo", () => {
  it("first gets a signed upload URL, then uploads to R2, then saves", async () => {
    const signedUrlResponse = {
      success: true,
      data: { uploadUrl: "https://r2.example.com/upload", fileKey: "my/file.mp4" },
    };
    const r2UploadResponse = { ok: true, status: 200, json: vi.fn() };
    const saveResponse = { success: true };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(signedUrlResponse),
      })
      .mockResolvedValueOnce(r2UploadResponse)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(saveResponse),
      });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const result = await pathwaysService.uploadVideo("leadership", file);

    // Call 1: get signed URL
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BASE_URL}/pathways/leadership/video/upload-url`
    );
    // Call 2: upload to R2
    expect(fetchMock.mock.calls[1][0]).toBe("https://r2.example.com/upload");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "PUT" });
    // Call 3: save fileKey
    expect(fetchMock.mock.calls[2][0]).toBe(`${BASE_URL}/pathways/leadership/video`);

    expect(result).toEqual(saveResponse);
  });

  it("aborts early if signed URL request fails", async () => {
    const failResponse = { success: false, error: "Unauthorized" };
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue(failResponse),
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File([""], "test.mp4", { type: "video/mp4" });
    const result = await pathwaysService.uploadVideo("leadership", file);

    expect(result).toEqual(failResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
