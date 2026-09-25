import { describe, it, expect } from "vitest";
import { filterUsers } from "@/lib/leaders-filter";

const users = [
  { role: "admin", status: "active" },
  { role: "super_admin", status: "active" },
  { role: "leader", status: "active" },
  { role: "leader", status: "inactive" },
  { role: "member", status: "active" },
  { role: "member", status: "inactive" },
];

describe("filterUsers", () => {
  it("excludes admins and super admins", () => {
    const result = filterUsers(users, "all", "all");
    expect(result.map((u) => u.role)).toEqual(["leader", "leader", "member", "member"]);
  });

  it("applies the status filter together with the leader role tab", () => {
    const result = filterUsers(users, "leader", "active");
    expect(result).toEqual([{ role: "leader", status: "active" }]);
  });

  it("includes every non-admin member when filtering status only", () => {
    const result = filterUsers(users, "all", "active");
    expect(result).toEqual([
      { role: "leader", status: "active" },
      { role: "member", status: "active" },
    ]);
  });

  it("keeps the status filter meaningful on the member tab", () => {
    const result = filterUsers(users, "member", "active");
    expect(result).toEqual([{ role: "member", status: "active" }]);
  });
});