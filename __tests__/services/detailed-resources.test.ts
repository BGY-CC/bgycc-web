import { describe, it, expect, vi, beforeEach } from "vitest";
import { detailedResourcesService } from "@/lib/services/detailed-resources";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-dres";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("detailedResourcesService.list", () => {
  it("calls GET /detailed-resources", async () => {
    const fetchMock = mockFetch({ resources: [] });
    vi.stubGlobal("fetch", fetchMock);

    await detailedResourcesService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/detailed-resources`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("detailedResourcesService.create", () => {
  it("sends POST /detailed-resources with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    const data = { title: "PDF Guide", category: "Leadership", resource_type: "pdf" as const };
    await detailedResourcesService.create(data);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/detailed-resources`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(data),
      })
    );
  });
});

describe("detailedResourcesService.update", () => {
  it("sends PUT /detailed-resources/:id with data", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await detailedResourcesService.update("dres-1", { title: "Updated" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/detailed-resources/dres-1`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ title: "Updated" }),
      })
    );
  });
});

describe("detailedResourcesService.delete", () => {
  it("returns { success: true } on 204", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 204));
    const result = await detailedResourcesService.delete("dres-del");
    expect(result).toEqual({ success: true });
  });

  it("returns { success: true } on 200", async () => {
    vi.stubGlobal("fetch", mockFetch(null, 200));
    const result = await detailedResourcesService.delete("dres-del");
    expect(result).toEqual({ success: true });
  });

  it("trims id whitespace", async () => {
    const fetchMock = mockFetch(null, 204);
    vi.stubGlobal("fetch", fetchMock);

    await detailedResourcesService.delete("  dres-xyz  ");

    const calledUrl: string = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("dres-xyz");
    expect(calledUrl).not.toMatch(/\s/);
  });

  it("parses JSON body for non-204/200 responses (lines 64-66)", async () => {
    const body = { success: false, error: "Not found" };
    vi.stubGlobal("fetch", mockFetch(body, 404));

    const result = await detailedResourcesService.delete("dres-missing");
    expect(result).toEqual(body);
  });

  it("falls back gracefully when json() throws (lines 67-68)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error("Not JSON")),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await detailedResourcesService.delete("dres-bad");
    expect(result).toEqual({ success: false });
  });
});

describe("detailedResourcesService.uploadImage", () => {
  it("sends multipart POST to /detailed-resources/upload-image", async () => {
    const fetchMock = mockFetch({ success: true, data: { url: "https://cdn/thumb.jpg" } });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["img"], "thumb.jpg", { type: "image/jpeg" });
    await detailedResourcesService.uploadImage(file);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/detailed-resources/upload-image`,
      expect.objectContaining({ method: "POST" })
    );
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Content-Type");
  });
});
