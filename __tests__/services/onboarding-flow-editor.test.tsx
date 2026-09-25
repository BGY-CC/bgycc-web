import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlowEditor } from "@/app/(dashboard)/onboarding-editor/_components/flow-editor";
import { ToastProvider } from "@/components/ui";
import {
  onboardingService,
  type OnboardingVersion,
} from "@/lib/services/onboarding";
import { analyticsService } from "@/lib/services/analytics";

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

const versionRows: OnboardingVersion[] = [
  {
    id: "vvvvvvvv-2222-2222-2222-222222222222",
    flow_id: "11111111-1111-1111-1111-111111111111",
    steps: flowBody.data.steps,
    version: 2,
    description: "Current published flow",
    created_at: "2026-09-10T10:00:00.000Z",
    created_by: "u1",
    creator: { id: "u1", full_name: "Ada Admin", email: "ada@bgycc.org" },
  },
  {
    id: "vvvvvvvv-1111-1111-1111-111111111111",
    flow_id: "11111111-1111-1111-1111-111111111111",
    steps: flowBody.data.steps,
    version: 1,
    description: "Initial flow",
    created_at: "2026-09-01T10:00:00.000Z",
    created_by: "u1",
    creator: { id: "u1", full_name: "Ada Admin", email: "ada@bgycc.org" },
  },
];

describe("FlowEditor preview", () => {
  it("renders every configured onboarding screen read-only in the preview", async () => {
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(screen.getByRole("button", { name: /preview/i }));

    const dialog = await screen.findByRole("dialog");
    const preview = within(dialog);
    expect(preview.getByText("Welcome Video")).toBeTruthy();
    expect(preview.getByText("Consent")).toBeTruthy();
    expect(preview.getByText("Vision")).toBeTruthy();
    expect(preview.getByText("I agree to the community guidelines.")).toBeTruthy();
    expect(preview.getByText("Confident, articulate youth.")).toBeTruthy();
    expect(
      preview.getByText("https://cdn.example.com/welcome.mp4")
    ).toBeTruthy();
  });
});

describe("FlowEditor version history", () => {
  it("lists versions and rolls back through the service on confirm", async () => {
    vi.stubGlobal("fetch", mockFetch(flowBody));
    vi.spyOn(onboardingService, "getVersions").mockResolvedValue({
      success: true,
      data: { versions: versionRows },
    });
    const rollbackSpy = vi
      .spyOn(onboardingService, "rollbackVersion")
      .mockResolvedValue({
        success: true,
        data: { message: "ok", flow: flowBody.data },
      });

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(
      screen.getByRole("button", { name: /version history/i })
    );

    expect(await screen.findByText("Current published flow")).toBeTruthy();
    expect(screen.getByText("Version 1")).toBeTruthy();
    expect(screen.getByText("Initial flow")).toBeTruthy();
    expect(screen.getAllByText(/Ada Admin/).length).toBeGreaterThan(0);

    await userEvent.click(
      screen.getByRole("button", { name: /rollback version 1/i })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Rollback version" })
    );

    await waitFor(() => {
      expect(rollbackSpy).toHaveBeenCalledWith(
        "vvvvvvvv-1111-1111-1111-111111111111"
      );
    });
  });
});

describe("FlowEditor step editing", () => {
  it("adds a step and publishes it in the PUT body", async () => {
    const updateSpy = vi
      .spyOn(onboardingService, "updateFlow")
      .mockResolvedValue({ success: true, data: { message: "ok", flow: flowBody.data } });
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(screen.getByRole("button", { name: /add step/i }));

    const dialog = await screen.findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Title"),
      "Accountability Partner"
    );
    await userEvent.type(
      within(dialog).getByLabelText("Description"),
      "Pick someone to keep you accountable."
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save step" })
    );

    expect(await screen.findByText("Accountability Partner")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      const [input] = updateSpy.mock.calls[0];
      expect(
        input.steps.some((s) => s.title === "Accountability Partner")
      ).toBe(true);
    });
  });

  it("edits an existing step and publishes the updated fields", async () => {
    const updateSpy = vi
      .spyOn(onboardingService, "updateFlow")
      .mockResolvedValue({ success: true, data: { message: "ok", flow: flowBody.data } });
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(
      screen.getByRole("button", { name: /edit welcome video/i })
    );

    const dialog = await screen.findByRole("dialog");
    const titleInput = within(dialog).getByLabelText("Title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Intro Video");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save step" })
    );

    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      const [input] = updateSpy.mock.calls[0];
      expect(
        input.steps.some((s) => s.title === "Intro Video")
      ).toBe(true);
    });
  });

  it("deletes a non-core step after confirmation and excludes it from publish", async () => {
    const updateSpy = vi
      .spyOn(onboardingService, "updateFlow")
      .mockResolvedValue({ success: true, data: { message: "ok", flow: flowBody.data } });
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(screen.getByRole("button", { name: /add step/i }));
    const addDialog = await screen.findByRole("dialog");
    await userEvent.type(
      within(addDialog).getByLabelText("Title"),
      "Temporary Step"
    );
    await userEvent.type(
      within(addDialog).getByLabelText("Description"),
      "Will be removed."
    );
    await userEvent.click(
      within(addDialog).getByRole("button", { name: "Save step" })
    );

    await userEvent.click(
      await screen.findByRole("button", { name: /delete temporary step/i })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete step" })
    );

    await waitFor(() => {
      expect(screen.queryByText("Temporary Step")).toBeNull();
    });

    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      const [input] = updateSpy.mock.calls[0];
      expect(input.steps.some((s) => s.title === "Temporary Step")).toBe(false);
    });
  });

  it("guards core steps from deletion", async () => {
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();
    await screen.findByText("Onboarding Flow Editor");

    await userEvent.click(
      screen.getByRole("button", { name: /delete consent/i })
    );

    expect(screen.queryByRole("button", { name: "Delete step" })).toBeNull();
    expect(screen.getByText("Consent")).toBeTruthy();
  });

  it("exports the drop-off CSV from the header action", async () => {
    const exportSpy = vi
      .spyOn(analyticsService, "downloadFunnelCsv")
      .mockResolvedValue(undefined);
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();

    await screen.findByDisplayValue("https://cdn.example.com/welcome.mp4");
    await userEvent.click(
      screen.getByRole("button", { name: "Export drop-off CSV" }),
    );

    await waitFor(() => {
      expect(exportSpy).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Drop-off CSV exported")).toBeTruthy();
  });
});

describe("FlowEditor clearing dedicated content fields", () => {
  it("persists cleared welcome video, consent and vision values in the published payload", async () => {
    const updateSpy = vi
      .spyOn(onboardingService, "updateFlow")
      .mockResolvedValue({ success: true, data: { message: "ok", flow: flowBody.data } });
    vi.stubGlobal("fetch", mockFetch(flowBody));

    renderFlowEditor();

    const urlInput = await screen.findByDisplayValue(
      "https://cdn.example.com/welcome.mp4"
    );
    const consentInput = await screen.findByDisplayValue(
      "I agree to the community guidelines."
    );
    const visionInput = await screen.findByDisplayValue(
      "Confident, articulate youth."
    );

    await userEvent.clear(urlInput);
    await userEvent.clear(consentInput);
    await userEvent.clear(visionInput);

    await userEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      const [input] = updateSpy.mock.calls[0];
      const welcome = input.steps.find((s) => s.id === "welcome_video");
      const consent = input.steps.find((s) => s.id === "consent");
      const vision = input.steps.find((s) => s.id === "vision");
      expect(welcome?.video_url ?? "").toBe("");
      expect(consent?.text ?? "").toBe("");
      expect(vision?.text ?? "").toBe("");
    });
  });
});