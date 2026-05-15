import { useEffect } from "react";

let lockCount = 0;

export const useScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    lockCount++;
    
    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Handle scrollbar width for desktop to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        document.body.style.overflow = "unset";
        document.body.style.paddingRight = "0px";
        lockCount = 0;
      }
    };
  }, [isOpen]);
};
