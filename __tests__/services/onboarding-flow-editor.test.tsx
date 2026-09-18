import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlowEditor } from "@/app/(dashboard)/onboarding-editor/_components/flow-editor";
import { ToastProvider } from "@/components/ui";
import { onboardingService } from "@/lib/services/onboarding";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/onboarding-editor",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    user: { id: "u1", email: "admin@bgycc.org", role: "admin" },
  }),
}));

const flowBody = {
  success: true,
  data: {
    id: "11111111-1111-1111-1111-111111111111",
    steps: [
      {
        id: "welcome_video",
        type: "video",
        title: "Welcome Video",
        description: "Watch the welcome video.",
        video_url: "https://cdn.example.com/welcome.mp4",
        is_mandatory: true,
        order: 1,
      },
      {
        id: "consent",
        type: "form",
        title: "Consent",
        description: "Community guidelines.",
        text: "I agree to the community guidelines.",
        is_mandatory: true,
        order: 2,
      },
      {
        id: "vision",
        type: "form",
        title: "Vision",
        description: "Share the vision.",
        text: "Confident, articulate youth.",
        is_mandatory: true,
        order: 3,
      },
    ],
    version: 2,
    is_active: true,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  },
};

const mockFetch = (body: unknown, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("bgycc-token", "tok");
  localStorage.setItem("bgycc-auth", "true");
  localStorage.setItem("bgycc-user", JSON.stringify({ id: "u1", role: "admin" }));
  vi.restoreAllMocks();
});

const renderFlowEditor = () =>
  render(
    <ToastProvider>
      <FlowEditor />
    </ToastProvider>
  );

describe("FlowEditor", () => {
  it("loads the flow and renders editable fields and step order", async () => {
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();

    await waitFor(async () => {
      expect(screen.getByText("Onboarding Flow Editor")).toBeTruthy();
      expect(await screen.findByDisplayValue("https://cdn.example.com/welcome.mp4")).toBeTruthy();
    });

    expect(
      await screen.findByDisplayValue("I agree to the community guidelines.")
    ).toBeTruthy();
    expect(await screen.findByDisplayValue("Confident, articulate youth.")).toBeTruthy();
    expect(screen.getByText("Welcome Video")).toBeTruthy();
    expect(screen.getByText("Consent")).toBeTruthy();
  });

  it("publishes edited content on submit", async () => {
    const updateSpy = vi
      .spyOn(onboardingService, "updateFlow")
      .mockResolvedValue({ success: true, data: { message: "ok", flow: flowBody.data } });
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();

    const urlInput = await screen.findByDisplayValue("https://cdn.example.com/welcome.mp4");
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, "https://cdn.example.com/welcome-v2.mp4");

    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          welcome_video_url: "https://cdn.example.com/welcome-v2.mp4",
          steps: expect.any(Array),
        })
      );
    });
  });
});