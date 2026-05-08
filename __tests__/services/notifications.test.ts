import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationsService } from "@/lib/services/notifications";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-notif";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

describe("notificationsService.list", () => {
  it("calls GET /notifications with page and page_size", async () => {
    const fetchMock = mockFetch({ success: true, data: { notifications: [] } });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.list({ page: 1 });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain(`${BASE_URL}/notifications`);
    expect(url).toContain("page=1");
    expect(url).toContain("page_size=20");
  });

  it("appends userId filter when provided", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.list({ page: 1, userId: "user-abc" });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("user_id=user-abc");
  });

  it("appends type filter when provided", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.list({ page: 1, type: "alert" });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("type=alert");
  });

  it("appends is_read filter when provided", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.list({ page: 1, isRead: true });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("is_read=true");
  });

  it("omits optional filters when not provided", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.list({ page: 1 });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).not.toContain("user_id");
    expect(url).not.toContain("type=");
    expect(url).not.toContain("is_read");
  });
});

describe("notificationsService.listMe", () => {
  it("calls GET /notifications/me with page and page_size", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.listMe({ page: 2 });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain(`${BASE_URL}/notifications/me`);
    expect(url).toContain("page=2");
  });

  it("appends is_read=false filter", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.listMe({ page: 1, isRead: false });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toContain("is_read=false");
  });
});

describe("notificationsService.markAsRead", () => {
  it("sends PATCH /notifications/:id/read", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.markAsRead("notif-123");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/notifications/notif-123/read`,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("includes auth header", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.markAsRead("notif-abc");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      })
    );
  });
});

describe("notificationsService.markAllAsRead", () => {
  it("sends POST /notifications/read-all", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await notificationsService.markAllAsRead();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/notifications/read-all`,
      expect.objectContaining({ method: "POST" })
    );
  });
});
