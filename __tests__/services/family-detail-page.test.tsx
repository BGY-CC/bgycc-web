import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import FamilyDetailPage from "@/app/(dashboard)/families/[familyId]/page";
import { ToastProvider } from "@/components/ui";
import { familiesService } from "@/lib/services/families";

vi.mock("next/navigation", () => ({
  useParams: () => ({ familyId: "parent-1" }),
}));

vi.mock("@/components/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/shared")>();
  return { ...actual, PageHeader: () => null };
});

vi.mock("@/lib/services/families", () => ({
  familiesService: {
    getStats: vi.fn(),
    merge: vi.fn(),
    split: vi.fn(),
  },
}));

const mockedGetStats = vi.mocked(familiesService.getStats);

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  mockedGetStats.mockReset();
});

describe("FamilyDetailPage getStats failure", () => {
  it("surfaces the error panel when getStats resolves with success:false", async () => {
    mockedGetStats.mockResolvedValue({ success: false, error: "Admin access required" });

    render(
      <ToastProvider>
        <FamilyDetailPage />
      </ToastProvider>
    );

    expect(await screen.findByText(/Admin access required/)).toBeTruthy();
  });
});
