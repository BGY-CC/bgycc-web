import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";

const push = vi.hoisted(() => vi.fn());
const clearQueryCacheSpy = vi.hoisted(() => vi.fn());
const router = vi.hoisted(() => ({ push }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/dashboard",
}));

vi.mock("@/hooks/use-query", () => ({
  clearQueryCache: clearQueryCacheSpy,
}));

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={logout}>
      Log out
    </button>
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("bgycc-auth", "true");
  localStorage.setItem("bgycc-token", "tok");
  localStorage.setItem("bgycc-refresh-token", "rt");
  localStorage.setItem("bgycc-user", JSON.stringify({ id: "u1", email: "a@b.com", role: "admin" }));
  clearQueryCacheSpy.mockClear();
  push.mockClear();
});

describe("AuthProvider logout", () => {
  it("clears the query cache and stored session, then redirects to login", async () => {
    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    );

    const button = await waitFor(() => screen.getByRole("button", { name: "Log out" }));
    fireEvent.click(button);

    expect(clearQueryCacheSpy).toHaveBeenCalledOnce();

    expect(localStorage.getItem("bgycc-auth")).toBeNull();
    expect(localStorage.getItem("bgycc-token")).toBeNull();
    expect(localStorage.getItem("bgycc-refresh-token")).toBeNull();
    expect(localStorage.getItem("bgycc-user")).toBeNull();

    expect(push).toHaveBeenCalledWith(ROUTES.LOGIN);
  });
});