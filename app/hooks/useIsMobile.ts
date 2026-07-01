"use client";

import { useEffect, useState } from "react";

// Returns true on viewports below Tailwind's `sm` breakpoint (640px).
// Starts as `false` on the server / first render to avoid hydration mismatch;
// updates after mount. Use it for behavior (e.g. auto-opening a dialog), not
// for layout — prefer CSS `sm:` utilities for what renders.
export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
