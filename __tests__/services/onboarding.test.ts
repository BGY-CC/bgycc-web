import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  onboardingService,
  type OnboardingFlow,
  type OnboardingVersion,
} from "@/lib/services/onboarding";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";

const mockFetch = (body: unknown, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch({ success: true }));
});

const sampleFlow: OnboardingFlow = {
  id: "11111111-1111-1111-1111-111111111111",
  steps: [
    {
      id: "welcome_video",
      type: "video",
      title: "Welcome Video",
      description: "Watch the BGYCC introductory/welcome video.",
      video_url: "https://example.com/welcome.mp4",
      is_mandatory: true,
      order: 1,
    },
    {
      id: "consent",
      type: "form",
      title: "Consent",
      description: "Consent to community guidelines.",
      text: "I agree to the BGYCC community guidelines.",
      is_mandatory: true,
      order: 2,
    },
  ],
  version: 1,
  is_active: true,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
};

describe("onboardingService.getFlow", () => {
  it("calls GET /onboarding/flow and returns the flow", async () => {
    const fetchMock = mockFetch({ success: true, data: sampleFlow });
    vi.stubGlobal("fetch", fetchMock);

    const result = await onboardingService.getFlow();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/onboarding/flow`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.data).toEqual(sampleFlow);
  });
});

describe("onboardingService.updateFlow", () => {
  it("calls PUT /onboarding/flow with steps and content shortcuts", async () => {
    const fetchMock = mockFetch({ success: true, data: { flow: sampleFlow } });
    vi.stubGlobal("fetch", fetchMock);

    await onboardingService.updateFlow({
      steps: sampleFlow.steps,
      consent_text: "Updated consent copy.",
      vision_text: "Updated vision copy.",
      welcome_video_url: "https://example.com/welcome-v2.mp4",
      description: "Publish updated flow",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/onboarding/flow`,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          steps: sampleFlow.steps,
          consent_text: "Updated consent copy.",
          vision_text: "Updated vision copy.",
          welcome_video_url: "https://example.com/welcome-v2.mp4",
          description: "Publish updated flow",
        }),
      })
    );
  });

  it("returns the parsed JSON response", async () => {
    const body = { success: true, data: { message: "Successfully updated onboarding flow (version 2)", flow: sampleFlow } };
    vi.stubGlobal("fetch", mockFetch(body));

    const result = await onboardingService.updateFlow({ steps: sampleFlow.steps });
    expect(result).toEqual(body);
  });
});

const sampleVersion: OnboardingVersion = {
  id: "22222222-2222-2222-2222-222222222222",
  flow_id: "11111111-1111-1111-1111-111111111111",
  steps: sampleFlow.steps,
  version: 2,
  description: "Updated onboarding flow",
  created_at: "2026-09-02T00:00:00.000Z",
  created_by: "33333333-3333-3333-3333-333333333333",
  creator: { id: "33333333-3333-3333-3333-333333333333", full_name: "Ada Admin", email: "ada@bgycc.org" },
};

describe("onboardingService.getVersions", () => {
  it("calls GET /onboarding/versions and returns the version list", async () => {
    const fetchMock = mockFetch({ success: true, data: { versions: [sampleVersion] } });
    vi.stubGlobal("fetch", fetchMock);

    const result = await onboardingService.getVersions();

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/onboarding/versions`,
      expect.objectContaining({ method: "GET" })
    );
    expect(result.data.versions).toEqual([sampleVersion]);
  });
});

describe("onboardingService.rollbackVersion", () => {
  it("calls POST /onboarding/versions/{id}/rollback and returns the new flow", async () => {
    const body = { success: true, data: { message: "ok", flow: sampleFlow } };
    const fetchMock = mockFetch(body);
    vi.stubGlobal("fetch", fetchMock);

    const result = await onboardingService.rollbackVersion(sampleVersion.id);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/onboarding/versions/${sampleVersion.id}/rollback`,
      expect.objectContaining({ method: "POST" })
    );
    expect(result).toEqual(body);
  });
});