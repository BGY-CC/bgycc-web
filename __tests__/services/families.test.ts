import { describe, it, expect, vi, beforeEach } from "vitest";
import { familiesService, reassignApprovalsService } from "@/lib/services/families";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";
const TOKEN = "test-token-families";

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

describe("familiesService.getStats", () => {
  it("calls GET /families/{familyId}/stats", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: { family_id: "parent-1", members: 3, active_children: 2 },
    });
    vi.stubGlobal("fetch", fetchMock);

    await familiesService.getStats("parent-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/families/parent-1/stats`,
      expect.objectContaining({ method: "GET" })
    );
  });
});

describe("familiesService.merge", () => {
  it("posts primary and secondary parent ids to /families/merge", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: { message: "Families merged", merged_children: 2, errors: [] },
    });
    vi.stubGlobal("fetch", fetchMock);

    await familiesService.merge({
      primaryParentId: "parent-1",
      secondaryParentId: "parent-2",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/families/merge`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          primaryParentId: "parent-1",
          secondaryParentId: "parent-2",
        }),
      })
    );
  });
});

describe("familiesService.split", () => {
  it("posts parent, child and destination parent ids to /families/split", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: {
        message: "Child moved to destination family",
        child_id: "child-1",
        destinationParentId: "parent-2",
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    await familiesService.split({
      parentId: "parent-1",
      childId: "child-1",
      destinationParentId: "parent-2",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/families/split`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          parentId: "parent-1",
          childId: "child-1",
          destinationParentId: "parent-2",
        }),
      })
    );
  });
});

describe("reassignApprovalsService.list", () => {
  it("calls GET /clubs/reassign-requests/pending", async () => {
    const fetchMock = mockFetch({ success: true, data: { requests: [] } });
    vi.stubGlobal("fetch", fetchMock);

    await reassignApprovalsService.list();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/reassign-requests/pending`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("throws on a non-ok response with the server message", async () => {
    vi.stubGlobal("fetch", mockFetch({ success: false, error: "Forbidden" }, 403));

    await expect(reassignApprovalsService.list()).rejects.toThrow("Forbidden");
  });
});

describe("reassignApprovalsService.confirm", () => {
  it("posts to /clubs/reassign-requests/{id}/confirm", async () => {
    const fetchMock = mockFetch({
      success: true,
      data: { message: "Applied", request_id: "req-1", reassigned_ids: [], demoted: [], errors: [] },
    });
    vi.stubGlobal("fetch", fetchMock);

    await reassignApprovalsService.confirm("req-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/reassign-requests/req-1/confirm`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws when the request can no longer be confirmed", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({ success: false, error: "Request has already been reviewed" }, 409)
    );

    await expect(reassignApprovalsService.confirm("req-1")).rejects.toThrow(
      "Request has already been reviewed"
    );
  });
});

describe("reassignApprovalsService.reject", () => {
  it("posts to /clubs/reassign-requests/{id}/reject", async () => {
    const fetchMock = mockFetch({ success: true, data: { message: "Rejected", request_id: "req-1" } });
    vi.stubGlobal("fetch", fetchMock);

    await reassignApprovalsService.reject("req-1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/clubs/reassign-requests/req-1/reject`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws on a non-ok response with the server message", async () => {
    vi.stubGlobal("fetch", mockFetch({ success: false, error: "Request not found" }, 404));

    await expect(reassignApprovalsService.reject("req-missing")).rejects.toThrow(
      "Request not found"
    );
  });
});