import { beforeEach, describe, expect, it, vi } from "vitest";
import { moderationService, ModerationReport } from "@/lib/services/moderation";
import { API_CONFIG } from "@/lib/api";

const TOKEN = "test-token-moderation";

const mockFetch = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(
      typeof body === "string" ? body : JSON.stringify(body)
    ),
  });

beforeEach(() => {
  localStorage.setItem("bgycc-token", TOKEN);
});

const report: ModerationReport = {
  id: "report_123",
  reporter_id: "user_1",
  reported_user_id: "user_2",
  content_type: "comment",
  content_id: "99aedbd0-7e9a-4a50-9f7f-6c106a4bbc28",
  reason: "Spam",
  status: "pending",
  action_taken: "",
  resolved_at: null,
  created_at: "2026-09-18T10:00:00.000Z",
};

describe("moderationService", () => {
  it("lists moderation reports with the auth token", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: { reports: [report], meta: { page: 1, page_size: 20, total_count: 1, total_pages: 1 } },
    });
    vi.stubGlobal("fetch", fetchMock);

    const reports = await moderationService.getReports();

    expect(reports).toEqual([report]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/reports`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
      })
    );
  });

  it("resolves a report with the action_taken body", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "ok" } });
    vi.stubGlobal("fetch", fetchMock);

    await moderationService.resolveReport("report_123", "muted");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/reports/report_123/resolve`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
        body: JSON.stringify({ action_taken: "muted" }),
      })
    );
  });

  it("mutes a user through the moderation mute endpoint", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "ok" } });
    vi.stubGlobal("fetch", fetchMock);

    await moderationService.muteUser("user_456", true);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/users/user_456/mute`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
        body: JSON.stringify({ is_muted: true }),
      })
    );
  });

  it("shadow-bans a user through the moderation shadow-ban endpoint", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "ok" } });
    vi.stubGlobal("fetch", fetchMock);

    await moderationService.shadowBanUser("user_789");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/users/user_789/shadow-ban`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
        body: JSON.stringify({ is_shadow_banned: true }),
      })
    );
  });

  it("throws when a mutation reports failure", async () => {
    const fetchMock = mockFetch({ success: false, error: "boom" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(moderationService.muteUser("user_456", true)).rejects.toThrow(
      "Failed to mute user"
    );
  });

  it("approves a report through the approve endpoint", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "ok" } });
    vi.stubGlobal("fetch", fetchMock);

    await moderationService.approveReport("report_123");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/reports/report_123/approve`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
      })
    );
  });

  it("rejects a report with the required reason body", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "ok" } });
    vi.stubGlobal("fetch", fetchMock);

    await moderationService.rejectReport("report_123", "Not a violation");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/moderation/reports/report_123/reject`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${TOKEN}`,
        }),
        body: JSON.stringify({ reason: "Not a violation" }),
      })
    );
  });
});