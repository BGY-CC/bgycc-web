import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourcesClient } from "@/app/(dashboard)/resources/_components/resources-client";
import { ToastProvider } from "@/components/ui";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    user: { id: "admin-1", role: "admin" },
  }),
}));

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
  min_rank_tier: null,
  min_streak_required: 0,
  pathway: null,
  category: "toolkit",
  tags: ["leadership"],
  version: 1,
  access_level: null,
  access_override: "none",
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
};

const CATEGORIES = [
  { id: "cat-1", slug: "toolkit", title: "Toolkits" },
  { id: "cat-2", slug: "growth-guides", title: "Growth Guides" },
];

const jsonResp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const router = async (url: string, init?: RequestInit): Promise<Response> => {
  const method = (init?.method || "GET").toUpperCase();

  if (method === "GET" && url.endsWith("/resources/categories")) {
    return jsonResp({ success: true, data: { categories: CATEGORIES } });
  }
  if (method === "GET" && url.endsWith("/resources/export/completions")) {
    return new Response(
      "resource_id,title,category,completions\n" +
        `${RESOURCE.id},Audit Guide,toolkit,3`,
      { status: 200, headers: { "Content-Type": "text/csv" } }
    );
  }
  if (method === "GET" && url.endsWith("/resources/completions")) {
    return jsonResp({
      success: true,
      data: {
        completions: [
          { resource_id: RESOURCE.id, title: "Audit Guide", category: "toolkit", completions: 3 },
        ],
        total: 3,
      },
    });
  }
  if (method === "GET" && url.endsWith("/resources")) {
    return jsonResp({ success: true, data: { resources: [RESOURCE] } });
  }
  if (method === "PUT" && url.includes("/resources/")) {
    return jsonResp({ success: true, data: { resource: { ...RESOURCE, version: 2 } } });
  }
  return jsonResp({ success: true, data: {} });
};

beforeEach(() => {
  localStorage.setItem("bgycc-token", "tok");
  localStorage.setItem("bgycc-auth", "true");
  localStorage.setItem("bgycc-user", JSON.stringify({ id: "admin-1", role: "admin" }));
  vi.restoreAllMocks();
});

const renderClient = () =>
  render(
    <ToastProvider>
      <ResourcesClient />
    </ToastProvider>
  );

describe("ResourcesClient", () => {
  it("renders a category picker populated from resource_categories", async () => {
    const fetchMock = vi.fn(router);
    vi.stubGlobal("fetch", fetchMock);

    renderClient();

    await screen.findByText("Audit Guide");

    await userEvent.click(screen.getByRole("button", { name: "Edit Audit Guide" }));

    const categorySelect = await screen.findByRole("combobox", { name: "Category" });
    expect(categorySelect).toBeTruthy();
    expect(screen.getByRole("option", { name: "Toolkits" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Growth Guides" })).toBeTruthy();
  });

  it("saves the full edited field set including bumped version and category", async () => {
    const fetchMock = vi.fn(router);
    vi.stubGlobal("fetch", fetchMock);

    renderClient();

    await screen.findByText("Audit Guide");

    await userEvent.click(screen.getByRole("button", { name: "Edit Audit Guide" }));

    const categorySelect = await screen.findByRole("combobox", { name: "Category" });
    await userEvent.selectOptions(categorySelect, "toolkit");

    await userEvent.type(screen.getByPlaceholderText("Type tag and press Enter"), "plain{Enter}");
    await userEvent.type(screen.getByPlaceholderText("e.g. gold"), "gold");
    await userEvent.clear(screen.getByPlaceholderText("0"));
    await userEvent.type(screen.getByPlaceholderText("0"), "3");

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Minimum rank tier" }), "3");
    await userEvent.click(screen.getByRole("radio", { name: "Access override: closed" }));

    await userEvent.click(screen.getByRole("button", { name: /Bump version/i }));
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      const putCall = fetchMock.mock.calls.find(
        ([, init]) => (init?.method || "GET").toUpperCase() === "PUT"
      );
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall![1].body);
      expect(body).toMatchObject({
        title: "Audit Guide",
        description: "desc",
        link: "https://drive.google.com/audit",
        tags: ["leadership", "plain"],
        version: 2,
        category: "toolkit",
        min_rank_required: "gold",
        min_rank_tier: 3,
        min_streak_required: 3,
        access_override: "closed",
        pathway: null,
        image_url: null,
        access_level: null,
        is_active: true,
      });
    });
  });

  it("shows completion counts and downloads the completions CSV", async () => {
    const fetchMock = vi.fn(router);
    vi.stubGlobal("fetch", fetchMock);

    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, writable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, writable: true });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderClient();

    await screen.findByText("Audit Guide");
    expect(await screen.findByText(/3 completions across 1 resource/)).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: /Export completions/i }));

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });
  });
});