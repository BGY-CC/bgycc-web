import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportMembersModal, parseMemberList } from "@/app/(dashboard)/clubs/_components/import-members-modal";
import { ToastProvider } from "@/components/ui";
import { clubsService, type Club } from "@/lib/services/clubs";

vi.mock("@/lib/services/clubs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services/clubs")>();
  return {
    ...actual,
    clubsService: { ...actual.clubsService, importMembers: vi.fn() },
  };
});

const club: Club = {
  id: "club-1",
  name: "Lagos Speakers Hub",
  leader_name: "Ada Obi",
  region: "Lagos",
  city: "Ikeja",
  state: "Lagos",
  is_active: true,
  total_members: 12,
  active_members: 10,
  average_streak: 4,
  status: "Active",
};

const renderModal = (overrides?: Partial<{ onClose: () => void; onSuccess: () => void }>) =>
  render(
    <ToastProvider>
      <ImportMembersModal
        club={club}
        onClose={overrides?.onClose ?? vi.fn()}
        onSuccess={overrides?.onSuccess ?? vi.fn()}
      />
    </ToastProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("parseMemberList", () => {
  it("splits emails and member IDs on newlines, commas and semicolons", () => {
    const result = parseMemberList(
      "alice@example.com\nbob@example.com, 3f8a0e21-7b2d-4f1e-9c8a-0d2f6b1a3c4d;charlie@Example.com",
    );

    expect(result.emails).toBe(3);
    expect(result.ids).toBe(1);
    expect(result.invalid).toEqual([]);
    expect(result.members).toEqual([
      { email: "alice@example.com" },
      { email: "bob@example.com" },
      { user_id: "3f8a0e21-7b2d-4f1e-9c8a-0d2f6b1a3c4d" },
      { email: "charlie@example.com" },
    ]);
  });

  it("tags tokens that are neither emails nor UUIDs as invalid", () => {
    const result = parseMemberList("not-an-email\nshort-id");

    expect(result.members).toEqual([]);
    expect(result.invalid).toEqual(["not-an-email", "short-id"]);
  });
});

describe("ImportMembersModal", () => {
  it("summarises parsed entries as the user types", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(
      screen.getByLabelText("Member emails or IDs"),
      "alice@example.com\n3f8a0e21-7b2d-4f1e-9c8a-0d2f6b1a3c4d",
    );

    expect(await screen.findByText("1 email")).toBeTruthy();
    expect(screen.getByText("1 member ID")).toBeTruthy();
    expect(screen.getByText("2 total")).toBeTruthy();
  });

  it("disables submit until at least one entry parses", async () => {
    const user = userEvent.setup();
    renderModal();

    const submit = screen.getByRole("button", { name: "Import members" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    await user.type(screen.getByLabelText("Member emails or IDs"), "alice@example.com");
    expect((screen.getByRole("button", { name: "Import members" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("imports via the service, toasts the result and notifies success", async () => {
    const user = userEvent.setup();
    vi.mocked(clubsService.importMembers).mockResolvedValue({
      success: true,
      data: { imported: 2, skipped: 1 },
    });
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    renderModal({ onClose, onSuccess });

    await user.type(
      screen.getByLabelText("Member emails or IDs"),
      "alice@example.com\nbob@example.com\nmissing@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Import members" }));

    await waitFor(() => {
      expect(clubsService.importMembers).toHaveBeenCalledWith("club-1", [
        { email: "alice@example.com" },
        { email: "bob@example.com" },
        { email: "missing@example.com" },
      ]);
    });
    expect(await screen.findByText("2 imported, 1 skipped")).toBeTruthy();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("shows the backend error message on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(clubsService.importMembers).mockResolvedValue({
      success: false,
      error: "members array exceeds the 500-item limit",
    });

    renderModal();

    await user.type(screen.getByLabelText("Member emails or IDs"), "alice@example.com");
    await user.click(screen.getByRole("button", { name: "Import members" }));

    expect(
      await screen.findByText("members array exceeds the 500-item limit"),
    ).toBeTruthy();
  });
});