import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { iconSize: 28, textSize: "text-sm", subtextSize: "text-[9px]" },
  md: { iconSize: 36, textSize: "text-base", subtextSize: "text-[10px]" },
  lg: { iconSize: 48, textSize: "text-lg", subtextSize: "text-xs" },
} as const;

/**
 * BGYCC brand logo — icon mark from /public/bgycc_logo.png + wordmark.
 *
 * TODO: Replace bgycc_logo.png with an SVG (bgycc_logo.svg) from the designer.
 * SVG is resolution-independent and renders crisp at all sizes / DPR values.
 * When the SVG arrives, drop it in /public/ under the same name and update
 * the src below — no other changes needed.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const { iconSize, textSize, subtextSize } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/bgycc_logo.svg"
        alt="BGYCC logo"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        priority
      />
      <div className={cn("leading-tight", className?.includes("flex-col") && "text-center")}>
        <span className={cn("block font-extrabold text-primary tracking-tight", textSize)}>
          BGYCC
        </span>
        <span className={cn("block font-bold uppercase tracking-[0.2em] text-accent", subtextSize)}>
          School of Leadership
        </span>
      </div>
    </div>
  );
}
