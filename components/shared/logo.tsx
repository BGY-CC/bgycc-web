import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { height: 32 },
  md: { height: 48 },
  lg: { height: 64 },
} as const;

/**
 * BGYCC brand logo.
 * Swap to a real <Image> component once the SVG/PNG asset is in /public.
 * The text fallback ensures the brand name is always readable.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const { height } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Replace with real logo asset */}
      <div
        className="flex items-center justify-center rounded-full bg-primary text-white font-bold text-xs"
        style={{ width: height, height }}
        aria-hidden="true"
      >
        B
      </div>
      <div className="leading-tight">
        <span className="block font-extrabold text-gray-900 text-base tracking-wide">
          BGYCC
        </span>
        <span className="block text-[10px] text-red-600 font-semibold uppercase tracking-widest">
          School of Leadership
        </span>
      </div>
    </div>
  );
}
