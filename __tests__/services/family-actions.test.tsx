import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FamilyActions } from "@/app/(dashboard)/families/_components/family-actions";
import { ToastProvider } from "@/components/ui";
import { familiesService } from "@/lib/services/families";

vi.mock("@/lib/services/families", () => ({
  familiesService: {
    merge: vi.fn(),
    split: vi.fn(),
  },
}));

const mergedMerge = vi.mocked(familiesService.merge);
const mergedSplit = vi.mocked(familiesService.split);

const CHILDREN = [
  {
    id: "child-1",
    full_name: "Ada Nwosu",
    status: "active",
    streak: 7,
    longest_streak: 14,
    badges: [],
    relationship: null,
  },
];

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  mergedMerge.mockReset();
  mergedMerge.mockResolvedValue({
    success: true,
    data: { message: "Families merged", merged_children: 1, errors: [] },
  });
  mergedSplit.mockReset();
  mergedSplit.mockResolvedValue({
    success: true,
    data: { message: "Child moved", child_id: "child-1", destinationParentId: "dest-1" },
  });
});

const renderActions = (onChanged: () => void = vi.fn()) =>
  render(
    <ToastProvider>
      <FamilyActions familyId="parent-1" members={CHILDREN} onChanged={onChanged} />
    </ToastProvider>
  );

describe("FamilyActions merge", () => {
  it("merges the secondary family after confirmation and calls onChanged", async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    renderActions(onChanged);

    await user.click(screen.getByRole("button", { name: /Merge families/i }));

    await screen.findByText(/Merge secondary family/i);
    await user.type(screen.getByPlaceholderText("Secondary parent user ID"), "parent-2");

    await user.click(screen.getByRole("button", { name: /^Merge family$/ }));

    await waitFor(() => {
      expect(mergedMerge).toHaveBeenCalledWith({
        primaryParentId: "parent-1",
        secondaryParentId: "parent-2",
      });
      expect(onChanged).toHaveBeenCalled();
    });
  });

  it("does not fire merge when the dialog is cancelled", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: /Merge families/i }));
    await screen.findByText(/Merge secondary family/i);

    await user.click(screen.getByRole("button", { name: /^Cancel$/ }));

    await waitFor(() => {
      expect(screen.queryByText(/Merge secondary family/i)).toBeNull();
    });
    expect(mergedMerge).not.toHaveBeenCalled();
  });
});

describe("FamilyActions split", () => {
  it("moves a child to the destination family after confirmation and calls onChanged", async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    renderActions(onChanged);

    await user.click(screen.getByRole("button", { name: /Move Ada Nwosu/i }));

    await screen.findByText(/Move Ada Nwosu to a different family/);
    await user.type(screen.getByPlaceholderText("Destination parent user ID"), "dest-1");

    await user.click(screen.getByRole("button", { name: /^Move child$/ }));

    await waitFor(() => {
      expect(mergedSplit).toHaveBeenCalledWith({
        parentId: "parent-1",
        childId: "child-1",
        destinationParentId: "dest-1",
      });
      expect(onChanged).toHaveBeenCalled();
    });
  });

  it("does not fire split when the dialog is cancelled", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: /Move Ada Nwosu/i }));
    await screen.findByText(/Move Ada Nwosu to a different family/);

    await user.click(screen.getByRole("button", { name: /^Cancel$/ }));

    await waitFor(() => {
      expect(screen.queryByText(/Move Ada Nwosu to a different family/)).toBeNull();
    });
    expect(mergedSplit).not.toHaveBeenCalled();
  });
});