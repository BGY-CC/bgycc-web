import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceModal } from "@/app/(dashboard)/resources/_components/resource-modal";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResourceModal", () => {
  it("renders tag chips and version for an existing resource", async () => {
    render(
      <ResourceModal
        open
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        mode="edit"
        defaultValues={{
          title: "Audit Guide",
          description: "desc",
          link: "https://drive.google.com/audit",
          tags: ["leadership", "video"],
          version: 2,
        }}
      />
    );

    expect(
      (screen.getByPlaceholderText("e.g. Daily Audio Report Guide") as HTMLInputElement).value
    ).toBe("Audit Guide");
    expect(screen.getByText("Version 2")).toBeTruthy();
    expect(screen.getByLabelText("Remove tag leadership")).toBeTruthy();
    expect(screen.getByLabelText("Remove tag video")).toBeTruthy();
  });

  it("bumps version +1 on save and posts the updated object", async () => {
    const onSuccess = vi.fn();
    render(
      <ResourceModal
        open
        onClose={vi.fn()}
        onSuccess={onSuccess}
        mode="edit"
        defaultValues={{
          title: "Audit Guide",
          description: "desc",
          link: "https://drive.google.com/audit",
          tags: ["leadership"],
          version: 2,
        }}
      />
    );

    await userEvent.click(screen.getByText(/Bump version/i));
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      const [data] = onSuccess.mock.calls[0];
      expect(data).toMatchObject({
        title: "Audit Guide",
        description: "desc",
        link: "https://drive.google.com/audit",
        tags: ["leadership"],
        version: 3,
      });
    });
  });

  it("renders a category picker populated from resource categories", async () => {
    render(
      <ResourceModal
        open
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        mode="add"
        categories={[
          { id: "cat-1", slug: "toolkit", title: "Toolkits" },
          { id: "cat-2", slug: "growth-guides", title: "Growth Guides" },
        ]}
      />
    );

    const categorySelect = screen.getByRole("combobox", { name: "Category" });
    expect(categorySelect).toBeTruthy();
    expect(screen.getByRole("option", { name: "Toolkits" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Growth Guides" })).toBeTruthy();
  });
});
