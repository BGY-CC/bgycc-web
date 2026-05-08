import { describe, it, expect, vi, beforeEach } from "vitest";
import { profilesService } from "@/lib/services/profiles";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-profiles";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("profilesService.list", () => {
  it("calls GET /users with default pagination", async () => {
    const fetchMock = mockFetch({ users: [] });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/users?page=1&page_size=20`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("omits Authorization header when token is absent (lines 35-38)", async () => {
    localStorage.clear();
    const fetchMock = mockFetch({ users: [] });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.list();

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("passes custom page and page_size", async () => {
    const fetchMock = mockFetch({ users: [] });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.list(3, 10);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/users?page=3&page_size=10`,
      expect.anything()
    );
  });
});

describe("profilesService.getDetails", () => {
  it("calls GET /users/:userId", async () => {
    const fetchMock = mockFetch({ id: "user-1", email: "test@test.com" });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.getDetails("user-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/users/user-1`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("profilesService.search", () => {
  it("calls GET /users/search with query and defaults", async () => {
    const fetchMock = mockFetch({ users: [] });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.search("john");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/users/search?q=john&page=1&page_size=20`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("passes custom page and page_size for search", async () => {
    const fetchMock = mockFetch({ users: [] });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.search("jane", 2, 5);

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("q=jane");
    expect(url).toContain("page=2");
    expect(url).toContain("page_size=5");
  });
});

describe("profilesService.updateRole", () => {
  it("sends PUT /profiles/:userId with role in body", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.updateRole("user-123", "admin");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/profiles/user-123`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ role: "admin" }),
      })
    );
  });

  it("sends auth header with updateRole", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await profilesService.updateRole("user-abc", "leader");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });
});
