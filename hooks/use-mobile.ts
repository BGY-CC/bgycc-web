"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

/**
 * Returns true when the viewport is narrower than the mobile breakpoint (768px).
 *
 * Initial value is derived synchronously via lazy `useState` initializer so
 * there is no flash on first render. The `useEffect` subscribes to resize
 * changes but never calls setState synchronously inside the effect body —
 * only in the MediaQueryList `change` callback.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
