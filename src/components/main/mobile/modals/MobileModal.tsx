"use client";

import { ReactNode, useEffect } from "react";
import { MobileFooter } from "../MobileFooter";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

export default function MobileModal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
}: MobileModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden pointer-events-none">
      {/* Modal Content */}
      <div className="absolute bottom-0 left-0 right-0 top-20 bg-white flex flex-col animate-slide-in-bottom overflow-hidden pointer-events-auto">
        {/* Close Button - Only show if showCloseButton is true */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded-full shadow-md transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-4">{children}</div>

        {/* Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
