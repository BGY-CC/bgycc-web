import { describe, expect, it } from "vitest";
import { isValidImageUrl, validateProfileImage } from "@/lib/profile-image";

describe("profile image", () => {
  it("V16 - accepts supported images and rejects invalid files", () => {
    expect(validateProfileImage(new File(["image"], "avatar.webp", { type: "image/webp" }))).toBeNull();
    expect(validateProfileImage(new File(["text"], "avatar.svg", { type: "image/svg+xml" }))).toMatch(/JPEG/);
    expect(validateProfileImage(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }))).toMatch(/2MB/);
  });

  it("only previews complete HTTP image URLs", () => {
    expect(isValidImageUrl("https://cdn.example.com/avatar.png")).toBe(true);
    expect(isValidImageUrl("not-yet-a-url")).toBe(false);
  });
});
