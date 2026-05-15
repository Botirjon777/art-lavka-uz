import { useEffect } from "react";

let lockCount = 0;

export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    lockCount++;
    
    // Prevent background scrolling - more aggressive for mobile/iOS
    const scrollY = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    // Handle scrollbar width for desktop to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        document.body.style.overflow = originalBodyOverflow || "unset";
        document.documentElement.style.overflow = originalHtmlOverflow || "unset";
        document.body.style.height = originalBodyHeight || "unset";
        document.documentElement.style.height = originalHtmlHeight || "unset";
        document.body.style.paddingRight = "0px";
        lockCount = 0;
      }
    };
  }, [isOpen]);
};
