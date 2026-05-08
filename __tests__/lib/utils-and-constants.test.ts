import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_DESCRIPTION, ROUTES } from "@/lib/constants";

// ─── utils.ts ─────────────────────────────────────────────────────────────────

describe("cn (class name merger)", () => {
  it("returns a single class as-is", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("merges multiple classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    // tailwind-merge collapses conflicting utilities — px-4 then px-8 → px-8
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("filters out falsy conditional values", () => {
    const isActive = false;
    expect(cn("base", isActive && "active")).toBe("base");
  });

  it("includes truthy conditional values", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles undefined and null inputs gracefully", () => {
    expect(cn("base", undefined, null as unknown as string)).toBe("base");
  });

  it("handles an empty call", () => {
    expect(cn()).toBe("");
  });

  it("deduplicates and merges complex Tailwind classes", () => {
    const result = cn("text-red-500 font-bold", "text-blue-500");
    // tailwind-merge resolves text color conflict
    expect(result).toBe("font-bold text-blue-500");
  });
});

// ─── constants.ts ─────────────────────────────────────────────────────────────

describe("APP_NAME", () => {
  it("has the correct app name", () => {
    expect(APP_NAME).toBe("BGYCC Admin");
  });
});

describe("APP_DESCRIPTION", () => {
  it("has the correct description", () => {
    expect(APP_DESCRIPTION).toBe("BGYCC School of Leadership — Admin Dashboard");
  });
});

describe("ROUTES", () => {
  it("defines all expected auth routes", () => {
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.FORGOT_PASSWORD).toBe("/forgot-password");
    expect(ROUTES.RESET_PASSWORD).toBe("/reset-password");
  });

  it("defines all expected dashboard routes", () => {
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.CLUBS).toBe("/clubs");
    expect(ROUTES.PATHWAY_CHECKLISTS).toBe("/pathway-checklists");
    expect(ROUTES.ONBOARDING_EDITOR).toBe("/onboarding-editor");
    expect(ROUTES.RESOURCES).toBe("/resources");
    expect(ROUTES.ANNOUNCEMENT).toBe("/announcement");
    expect(ROUTES.USERS).toBe("/users");
  });
});
