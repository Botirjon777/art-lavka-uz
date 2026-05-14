"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  showBackgroundImage?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  showBackgroundImage = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Get scrollbar width before hiding overflow
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Set overflow hidden and add padding to prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Reset styles
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-fit max-w-[98vw] max-h-[95vh] animate-modal-enter overflow-auto rounded-[30px] bg-white shadow-2xl ${
          showBackgroundImage ? "bg-image" : ""
        }`}
      >
        <div className="p-10 relative">
          <button
            onClick={onClose}
            className="absolute -right-4 -top-4 w-12 h-12 flex items-center justify-center bg-white text-gray-400 hover:text-[#8814B1] hover:shadow-xl rounded-full transition-all text-3xl z-50 border border-gray-100 shadow-lg group active:scale-90"
            aria-label="Close modal"
          >
            <span className="group-hover:rotate-90 transition-transform duration-300">×</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
