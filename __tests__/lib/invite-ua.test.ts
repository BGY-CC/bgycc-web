import { describe, expect, it } from "vitest";
import {
  formatInviteCode,
  resolveInvitePlatform,
} from "@/lib/invite/ua";

describe("resolveInvitePlatform", () => {
  it("returns ios for iPhone and iPad user agents", () => {
    expect(
      resolveInvitePlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)"),
    ).toBe("ios");
    expect(
      resolveInvitePlatform("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)"),
    ).toBe("ios");
  });

  it("returns android for Android user agents", () => {
    expect(
      resolveInvitePlatform("Mozilla/5.0 (Linux; Android 14; Pixel 8)"),
    ).toBe("android");
  });

  it("returns other for desktop user agents", () => {
    expect(
      resolveInvitePlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"),
    ).toBe("other");
  });
});

describe("formatInviteCode", () => {
  it("segments long alphanumeric codes into two groups", () => {
    expect(formatInviteCode("wvx123")).toBe("WVX 123");
  });

  it("leaves short codes and dash-separated codes untouched", () => {
    expect(formatInviteCode("ab12")).toBe("AB12");
    expect(formatInviteCode("abc-123")).toBe("ABC-123");
  });
});