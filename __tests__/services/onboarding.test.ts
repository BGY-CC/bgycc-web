import { describe, it, expect, vi, beforeEach } from "vitest";
import { onboardingService, type OnboardingFlow } from "@/lib/services/onboarding";

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