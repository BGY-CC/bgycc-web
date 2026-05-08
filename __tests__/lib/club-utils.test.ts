import { describe, it, expect } from "vitest";
import {
  getClubId,
  normalizeClubId,
  filterAndNormalizeClubs,
} from "@/lib/services/club-utils";

describe("getClubId", () => {
  it("returns the id field when present", () => {
    expect(getClubId({ id: "club-1", name: "Club A" })).toBe("club-1");
  });

  it("falls back to club_id when id is absent", () => {
    expect(getClubId({ club_id: "club-2", name: "Club B" })).toBe("club-2");
  });

  it("falls back to uuid when id and club_id are absent", () => {
    expect(getClubId({ uuid: "club-3" })).toBe("club-3");
  });

  it("falls back to clubId", () => {
    expect(getClubId({ clubId: "club-4" })).toBe("club-4");
  });

  it("falls back to _id", () => {
    expect(getClubId({ _id: "club-5" })).toBe("club-5");
  });

  it("returns undefined when no known id field is present", () => {
    expect(getClubId({ name: "No ID Club" })).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(getClubId(null)).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getClubId(undefined)).toBeUndefined();
  });

  it("ignores the string 'undefined' as a value", () => {
    expect(getClubId({ id: "undefined" })).toBeUndefined();
  });

  it("prefers id over club_id when both present", () => {
    expect(getClubId({ id: "primary", club_id: "secondary" })).toBe("primary");
  });
});

describe("normalizeClubId", () => {
  it("returns club with id field set", () => {
    const club = { club_id: "c-1", name: "My Club", is_active: true, total_members: 10, active_members: 5, average_streak: 3 };
    const result = normalizeClubId(club);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("c-1");
  });

  it("returns null when no valid id found", () => {
    expect(normalizeClubId({ name: "No ID" })).toBeNull();
  });

  it("returns null for null input", () => {
    expect(normalizeClubId(null)).toBeNull();
  });

  it("preserves existing club properties", () => {
    const club = { id: "c-2", name: "Preserved Club", is_active: true, total_members: 1, active_members: 1, average_streak: 1 };
    const result = normalizeClubId(club);
    expect(result!.name).toBe("Preserved Club");
    expect(result!.is_active).toBe(true);
  });
});

describe("filterAndNormalizeClubs", () => {
  it("filters out clubs without valid ids", () => {
    const clubs = [
      { id: "c-1", name: "Club A", is_active: true, total_members: 1, active_members: 1, average_streak: 1 },
      { name: "No ID Club" }, // should be filtered
      { id: "c-3", name: "Club C", is_active: true, total_members: 1, active_members: 1, average_streak: 1 },
    ];
    const result = filterAndNormalizeClubs(clubs);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(["c-1", "c-3"]);
  });

  it("returns empty array when all clubs lack ids", () => {
    const result = filterAndNormalizeClubs([{ name: "A" }, { name: "B" }]);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterAndNormalizeClubs([])).toEqual([]);
  });

  it("normalizes club_id to id field", () => {
    const clubs = [{ club_id: "c-5", name: "Club E", is_active: false, total_members: 0, active_members: 0, average_streak: 0 }];
    const result = filterAndNormalizeClubs(clubs);
    expect(result[0].id).toBe("c-5");
  });
});
