import { describe, expect, it, vi } from "vitest";
import { ADMIN_MUTATION_EVENT, notifyAdminMutation } from "@/lib/audit-events";
import { formatAuditStatement } from "@/lib/audit-format";

describe("audit presentation", () => {
  it("V14 - describes an audit record as actor, action, and resource", () => {
    expect(formatAuditStatement("Super Admin", "update", "profiles")).toBe(
      "Super Admin performed the update action on Profiles",
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
});
