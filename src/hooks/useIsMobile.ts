"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the current device is mobile
 * @param breakpoint - The breakpoint in pixels (default: 768px for md breakpoint)
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    // Initial check
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
