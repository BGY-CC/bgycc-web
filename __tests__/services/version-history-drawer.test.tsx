import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersionHistoryDrawer } from "@/app/(dashboard)/resources/_components/version-history-drawer";
import { ToastProvider } from "@/components/ui";
import { resourcesService } from "@/lib/services/resources";

const RESOURCE = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "audit-guide",
  title: "Audit Guide",
  description: "desc",
  image_url: null,
  link: "https://drive.google.com/audit",
  xp_reward: 10,
  is_active: true,
  min_rank_required: null,
  min_streak_required: 0,
  pathway: null,
  category: "toolkit",
  tags: ["leadership"],
  version: 3,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-02T00:00:00.000Z",
};

const VERSIONS = [
  {
    id: "v3",
    resource_id: RESOURCE.id,
    version: 3,
    editor_id: null,
    change_note: null,
    snapshot: {},
    created_at: "2026-09-02T00:00:00.000Z",
  },
  {
    id: "v2",
    resource_id: RESOURCE.id,
    version: 2,
    editor_id: null,
    change_note: "Reverted to version 1",
    snapshot: {},
    created_at: "2026-09-01T12:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VersionHistoryDrawer", () => {
  it("lists every saved version with its change note", async () => {
    vi.spyOn(resourcesService, "listVersions").mockResolvedValue({
      success: true,
      data: { versions: VERSIONS, total: 2 },
    });

    render(
      <ToastProvider>
        <VersionHistoryDrawer resource={RESOURCE} open onClose={vi.fn()} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Version 3")).toBeTruthy();
      expect(screen.getByText("Version 2")).toBeTruthy();
    });
    expect(screen.getByText("Reverted to version 1")).toBeTruthy();
  });

  it("restores a previous version via POST rollback and reloads history", async () => {
    const listSpy = vi
      .spyOn(resourcesService, "listVersions")
      .mockResolvedValue({ success: true, data: { versions: VERSIONS, total: 2 } });
    const rollbackSpy = vi
      .spyOn(resourcesService, "rollback")
      .mockResolvedValue({ success: true, data: { resource: RESOURCE } });
    const onRollback = vi.fn();

    render(
      <ToastProvider>
        <VersionHistoryDrawer resource={RESOURCE} open onClose={vi.fn()} onRollback={onRollback} />
      </ToastProvider>
    );

    const restoreButtons = await screen.findAllByRole("button", { name: "Restore" });
    await userEvent.click(restoreButtons[1]);

    await userEvent.click(screen.getByRole("button", { name: "Restore version" }));

    await waitFor(() => {
      expect(rollbackSpy).toHaveBeenCalledWith(RESOURCE.id, 2);
    });
    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledTimes(2);
      expect(onRollback).toHaveBeenCalled();
    });
  });
});