import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { iconSize: 32, textSize: "text-xl", subtextSize: "text-[8px]", tracking: "tracking-[0.1em]" },
  md: { iconSize: 48, textSize: "text-2xl", subtextSize: "text-[9px]", tracking: "tracking-[0.15em]" },
  lg: { iconSize: 72, textSize: "text-5xl", subtextSize: "text-[12px]", tracking: "tracking-[0.05em]" },
} as const;

export function Logo({ className, size = "md" }: LogoProps) {
  const { iconSize, textSize, subtextSize, tracking } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Image
        src="/bgycc_logo.svg"
        alt="BGYCC logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        priority
      />
      <div className={cn("flex flex-col leading-none", className?.includes("flex-col") && "items-center")}>
        <span className={cn("block font-extrabold text-primary tracking-tighter", textSize)}>
          BGYCC
        </span>
        <span className={cn("block font-semibold uppercase text-accent", subtextSize, tracking)}>
          School of Leadership
        </span>
      </div>
    </div>
  );
}
