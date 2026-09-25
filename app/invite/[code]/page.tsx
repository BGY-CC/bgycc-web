import type { Metadata } from "next";
import { headers } from "next/headers";
import { Logo } from "@/components/shared";
import { InviteLanding } from "@/components/invite/invite-landing";
import { resolveInvitePlatform } from "@/lib/invite/ua";

export const metadata: Metadata = {
  title: "Join me on BGYCC",
  description: "You've been invited to the BGYCC School of Leadership.",
};

// Dynamic per-request: reads the visitor's User-Agent to pick the right store
// and keeps the landing self-contained (no backend dependency).
export const dynamic = "force-dynamic";

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "https://apps.apple.com/";
const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "https://play.google.com/store/apps";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const userAgent = (await headers()).get("user-agent") ?? "";
  const platform = resolveInvitePlatform(userAgent);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-start bg-background px-4 py-10 sm:justify-center sm:py-12">
      <Logo size="md" className="mb-8" />
      <InviteLanding
        code={code}
        platform={platform}
        appStoreUrl={APP_STORE_URL}
        playStoreUrl={PLAY_STORE_URL}
      />
    </main>
  );
}