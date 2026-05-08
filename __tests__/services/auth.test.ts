import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/lib/services/auth";

const BASE_URL = "https://uzdrrelxsjtvjvqbxcfy.supabase.co/functions/v1/admin";

const mockFetch = (body: unknown, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch({ success: true }));
});

describe("authService.login", () => {
  it("calls the correct URL with POST", async () => {
    const fetchMock = mockFetch({ success: true, data: { token: "abc" } });
    vi.stubGlobal("fetch", fetchMock);

    await authService.login("user@test.com", "password123");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ email: "user@test.com", password: "password123" }),
      })
    );
  });

  it("returns the parsed JSON response", async () => {
    const responseBody = { success: true, data: { token: "tok123" } };
    vi.stubGlobal("fetch", mockFetch(responseBody));

    const result = await authService.login("user@test.com", "pass");
    expect(result).toEqual(responseBody);
  });
});

describe("authService.forgotPassword", () => {
  it("calls the forgotten-password endpoint with correct payload", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);
    // stub window.location.origin
    vi.stubGlobal("window", { location: { origin: "https://admin.bgycc.com" } });

    await authService.forgotPassword("user@test.com");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/auth/forgotten-password`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "user@test.com",
          redirectTo: "https://admin.bgycc.com/reset-password",
        }),
      })
    );
  });
});

describe("authService.verifyOtp", () => {
  it("calls verify-otp with email and token", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await authService.verifyOtp("user@test.com", "123456");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/auth/verify-otp`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@test.com", token: "123456" }),
      })
    );
  });
});

describe("authService.resetPassword", () => {
  it("calls reset-password with bearer token", async () => {
    const fetchMock = mockFetch({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await authService.resetPassword("newpass123", "temp-token-xyz");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/auth/reset-password`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer temp-token-xyz",
        }),
        body: JSON.stringify({ password: "newpass123" }),
      })
    );
  });
});
