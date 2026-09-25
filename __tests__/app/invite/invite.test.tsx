import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InviteLanding } from "@/components/invite/invite-landing";

const APP_STORE_URL = "https://apps.apple.com/";
const PLAY_STORE_URL = "https://play.google.com/store/apps";

describe("InviteLanding", () => {
  it("renders the code, the /invite/{code} link, and the iOS App Store badge", () => {
    render(
      <InviteLanding
        code="wvx123"
        platform="ios"
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Join me on BGYCC" }),
    ).toBeTruthy();
    expect(screen.getByText("WVX 123")).toBeTruthy();
    expect(screen.getByText("https://bgycc.app/invite/wvx123")).toBeTruthy();

    const appBadge = screen.getByRole("link", {
      name: /Download on the App Store/i,
    });
    expect(appBadge).toBeTruthy();
    expect(appBadge.getAttribute("href")).toBe(APP_STORE_URL);
    expect(
      screen.queryByRole("link", { name: "Get it on Google Play" }),
    ).toBeNull();
  });

  it("shows only the Play badge for Android visitors", () => {
    render(
      <InviteLanding
        code="ab12"
        platform="android"
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />,
    );

    const playBadge = screen.getByRole("link", { name: "Get it on Google Play" });
    expect(playBadge).toBeTruthy();
    expect(playBadge.getAttribute("href")).toBe(PLAY_STORE_URL);
    expect(
      screen.queryByRole("link", { name: /Download on the App Store/i }),
    ).toBeNull();
  });

  it("shows both store badges for desktop visitors", () => {
    render(
      <InviteLanding
        code="ab12"
        platform="other"
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Download on the App Store/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Get it on Google Play" }),
    ).toBeTruthy();
  });

  it("copies the deep link and confirms with a copied state", async () => {
    const user = userEvent.setup();
    render(
      <InviteLanding
        code="wvx123"
        platform="ios"
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy invite link" }));

    expect(
      await screen.findByRole("button", { name: "Link copied" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Copy invite link" })).toBeNull();
  });
});