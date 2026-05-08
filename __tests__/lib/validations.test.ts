import { describe, it, expect } from "vitest";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("accepts optional rememberMe field", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Enter a valid email address");
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Password must be at least 8 characters");
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts password of exactly 8 characters", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "12345678" });
    expect(result.success).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Enter a valid email address");
  });

  it("rejects empty object", () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass1",
      confirmPassword: "StrongPass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass1",
      confirmPassword: "DifferentPass",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Passwords do not match");
    expect(result.error?.issues[0].path).toContain("confirmPassword");
  });

  it("rejects password shorter than 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Password must be at least 8 characters");
  });

  it("rejects missing confirmPassword", () => {
    const result = resetPasswordSchema.safeParse({ password: "StrongPass1" });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 8-character matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });
});
