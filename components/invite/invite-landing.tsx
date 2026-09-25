"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { formatInviteCode, type InvitePlatform } from "@/lib/invite/ua";

interface InviteLandingProps {
  code: string;
  platform: InvitePlatform;
  appStoreUrl: string;
  playStoreUrl: string;
}

const DEEP_LINK_ORIGIN = "https://bgycc.app";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return false;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 shrink-0" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.417 2.205-1.241 3.15-.991 1.117-2.269 1.667-3.579 1.556-.126-.963.328-2.023 1.088-2.823.84-.884 2.234-1.564 3.379-1.449.082.185.353.566.353.566zM12.612 2.451c.041.266-.004.51-.149.732-.403.619-.903 1.166-1.455 1.598-.577.451-1.246.841-1.849.636-.335-.114-.563-.366-.647-.75-.119-.546-.101-.999.098-1.386.396-.766.998-1.425 1.852-1.889.593-.322 1.208-.481 1.814-.454.227.198.334.418.336.513zM17.546 5.217c.613.637 1.391 1.088 2.022 1.381-.091.845-.524 2.061-.939 2.917-.389.803-1.015 1.839-1.968 1.839-.588 0-.761-.931-2.972-.931-.635 0-1.254.452-1.859.896-.754.551-1.558.662-2.268.249-1.063-1.155-1.408-4.362-2.186-5.786-.871-1.596-1.77-2.787-2.545-2.787-.432 0-1.053.89-1.739 1.889-.916.784-1.189 1.794-1.189 3.033 0 1.993.432 3.763.823 4.572.373.774.677 1.487.677 2.366 0 .837-1.386 3.551-2.29 4.028-1.189.629-2.441.655-3.345.655-1.012 0-1.146-1.117-1.146-.837 0 .293-.021.373-.021.971 0 .93.064 1.186.021 1.145-.626.28-1.687-.13-2.135-.772.318-1.235.692-.533.729-1.18-1.192.353-2.187-.951-2.45-1.997-.311-1.238-.231-2.771.167-4.081.379-1.261 1.07-2.438 1.984-3.462.505-1.003 1.416-1.873 2.517-2.353.584-.254.94-.366 1.43-.366.564 0 1.12.199 1.756.601.441.279.785.443 1.013.443.278 0 .669-.184 1.177-.532.77-.527 1.246-.705 1.873-.705.911 0 1.74.453 2.594 1.353z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
      <path d="M3 20.5v-17C2.999 2.912 1.632 2.455 3.09 3.4l13.5 8.5c.44.277.44.994 0 1.272l-13.5 8.5C1.632 19.11 2.999 19.088 3 20.5z" fill="currentColor" />
    </svg>
  );
}

interface StoreBadgeProps {
  href: string;
  icon: ReactNode;
  line1: string;
  line2: string;
}

function StoreBadge({ href, icon, line1, line2 }: StoreBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl bg-black px-4 py-2.5 text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
    >
      {icon}
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-widest text-white/70">{line1}</span>
        <span className="text-sm font-semibold">{line2}</span>
      </span>
    </a>
  );
}

const AppStoreBadge = ({ href }: { href: string }) => (
  <StoreBadge href={href} icon={<AppleIcon />} line1="Download on the" line2="App Store" />
);

const PlayStoreBadge = ({ href }: { href: string }) => (
  <StoreBadge href={href} icon={<PlayIcon />} line1="Get it on" line2="Google Play" />
);

export function InviteLanding({
  code,
  platform,
  appStoreUrl,
  playStoreUrl,
}: InviteLandingProps) {
  const deepLink = `${DEEP_LINK_ORIGIN}/invite/${encodeURIComponent(code)}`;
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    const ok = await copyText(deepLink);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [deepLink]);

  const storeBadges: ReactNode[] =
    platform === "ios"
      ? [<AppStoreBadge key="app" href={appStoreUrl} />]
      : platform === "android"
        ? [<PlayStoreBadge key="play" href={playStoreUrl} />]
        : [
            <AppStoreBadge key="app" href={appStoreUrl} />,
            <PlayStoreBadge key="play" href={playStoreUrl} />,
          ];

  return (
    <section className="w-full max-w-[560px]">
      <div className="rounded-3xl border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          You&apos;ve been invited
        </p>
        <h1 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Join me on BGYCC
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-subtle">
          A fellow member invited you to the School of Leadership. Enter your
          invite code when you sign up, then download the app to get started.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0f1740] shadow-lg shadow-primary/20">
          <div className="flex items-stretch">
            <div className="flex items-center py-5 pl-4 pr-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40 [writing-mode:vertical-rl]">
                Invite
              </span>
            </div>
            <div className="my-4 w-px border-l border-dashed border-white/25" />
            <div className="flex flex-1 flex-col gap-2 px-5 py-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Your invite code
              </span>
              <span className="text-4xl font-extrabold tracking-[0.14em] text-white sm:text-[2.75rem]">
                {formatInviteCode(code)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button onClick={onCopy} size="lg" className="w-full sm:w-auto">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Link copied" : "Copy invite link"}
          </Button>
          <p className="flex max-w-full items-center gap-1.5 text-xs text-subtle">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{deepLink}</span>
          </p>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm font-semibold text-primary">Get the app</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {storeBadges}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        BGYCC — School of Leadership
      </p>
    </section>
  );
}