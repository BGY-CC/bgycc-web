import { describe, expect, it, vi } from "vitest";
import { ADMIN_MUTATION_EVENT, notifyAdminMutation } from "@/lib/audit-events";
import { formatAuditStatement, isAuditDateInRange } from "@/lib/audit-format";

describe("audit presentation", () => {
  it("V14 - describes an audit record as actor, action, and resource", () => {
    expect(formatAuditStatement("Admin X", "create", "users", "User Y")).toBe(
      "Admin X created a new user User Y",
    );
    expect(formatAuditStatement("Super Admin", "update", "clubs", "Lagos Speakers Hub")).toBe(
      "Super Admin updated club Lagos Speakers Hub",
    );
  });

  it("V15 - announces a completed admin mutation for live audit refresh", () => {
    const listener = vi.fn();
    window.addEventListener(ADMIN_MUTATION_EVENT, listener);

    notifyAdminMutation("/profiles/me", "PUT");

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      endpoint: "/profiles/me",
      method: "PUT",
    });
    window.removeEventListener(ADMIN_MUTATION_EVENT, listener);
  });

  it("V22 - filters timestamps by Lagos calendar date", () => {
    expect(isAuditDateInRange("2026-06-12T23:30:00.000Z", "2026-06-13", "2026-06-13")).toBe(true);
    expect(isAuditDateInRange("2026-06-12T22:59:59.000Z", "2026-06-13", "2026-06-13")).toBe(false);
    expect(isAuditDateInRange("2026-06-13T22:59:59.000Z", "2026-06-13", "2026-06-13")).toBe(true);
  });
});
