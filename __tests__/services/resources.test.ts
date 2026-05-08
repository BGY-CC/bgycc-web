import { describe, it, expect, vi, beforeEach } from "vitest";
import { resourcesService } from "@/lib/services/resources";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-resources";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("resourcesService.list", () => {
  it("calls GET /resources", async () => {
    const fetchMock = mockFetch({ resources: [] });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("resourcesService.create", () => {
  it("sends POST /resources with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { title: "New Resource", xp_reward: 50 };
    await resourcesService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("resourcesService.update", () => {
  it("sends PUT /resources/:id with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.update("res-1", { title: "Updated" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/res-1`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
      })
    );
  });
});

describe("resourcesService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await resourcesService.delete("res-del");
    expect(result).toEqual({ success: true });
  });

  it("returns { success: true } on 200", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await resourcesService.delete("res-del");
    expect(result).toEqual({ success: true });
  });

  it("trims id whitespace", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await resourcesService.delete("  res-xyz  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("res-xyz");
    expect(calledUrl).not.toMatch(/\s/);
  });

  it("parses JSON body for non-204/200 responses (lines 66-68)", async () => {
    const body = { success: false, error: "Not found" };
    vi.stubGlobal("fetch", mockFetch(body, 404));

    const result = await resourcesService.delete("res-missing");
    expect(result).toEqual(body);
  });

  it("falls back gracefully when json() throws (lines 69-70)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("Not JSON")),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await resourcesService.delete("res-bad");
    expect(result).toEqual({ success: false });
  });
});

describe("resourcesService.uploadImage", () => {
  it("sends multipart POST to /resources/upload-image", async () => {
    const fetchMock = mockFetch({ success: true, data: { url: "https://cdn/img.jpg" } });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    await resourcesService.uploadImage(file);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/resources/upload-image`,
      expect.objectContaining({ method: "POST" })
    );
    // No Content-Type should be set for multipart
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Content-Type");
  });

  it("includes Authorization header in upload", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    await resourcesService.uploadImage(file);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });
});
