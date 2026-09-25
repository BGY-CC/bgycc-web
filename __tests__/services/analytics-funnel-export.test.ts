import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyticsService } from "@/lib/services/analytics";

const CSV = "step,started,completed,drop_rate\nWelcome,100,80,20.0\n";

const mockFetch = (body: string, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(body),
  });

let createObjectUrlSpy: ReturnType<typeof vi.fn>;
let revokeObjectUrlSpy: ReturnType<typeof vi.fn>;
let clickSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  createObjectUrlSpy = vi.fn(() => "blob:mock");
  revokeObjectUrlSpy = vi.fn();
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: createObjectUrlSpy,
    revokeObjectURL: revokeObjectUrlSpy,
  });
  clickSpy = vi.fn();
  vi.spyOn(document, "createElement").mockImplementation((tag) => {
    if (tag === "a") {
      return { href: "", download: "", click: clickSpy } as unknown as HTMLAnchorElement;
    }
    return document.createElement(tag);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("analyticsService.downloadFunnelCsv", () => {
  it("fetches /analytics/funnel with format=csv and the auth header", async () => {
    const fetchMock = mockFetch(CSV);
    vi.stubGlobal("fetch", fetchMock);

    await analyticsService.downloadFunnelCsv();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/analytics/funnel?format=csv");
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("forwards optional funnel filters as query params", async () => {
    const fetchMock = mockFetch(CSV);
    vi.stubGlobal("fetch", fetchMock);

    await analyticsService.downloadFunnelCsv({ region: "Central", role: "Member" });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("format=csv");
    expect(url).toContain("region=Central");
    expect(url).toContain("role=Member");
  });

  it("triggers a csv download from the response body", async () => {
    vi.stubGlobal("fetch", mockFetch(CSV));

    await analyticsService.downloadFunnelCsv();

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectUrlSpy.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe(CSV);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.href).toBe("blob:mock");
    expect(anchor.download).toMatch(/^drop-off-funnel-\d{4}-\d{2}-\d{2}\.csv$/);

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:mock");
  });

  it("throws when the funnel endpoint fails", async () => {
    vi.stubGlobal("fetch", mockFetch("", 500));

    await expect(analyticsService.downloadFunnelCsv()).rejects.toThrow(
      "Funnel export failed (500)",
    );
  });
});