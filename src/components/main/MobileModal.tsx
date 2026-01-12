"use client";

import { ReactNode, useEffect } from "react";
import Image from "next/image";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function MobileModal({
  isOpen,
  onClose,
  children,
  title,
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
    <div className="fixed inset-0 z-100 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative h-full bg-white flex flex-col animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          {/* Menu Button */}
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/art-lavka.png"
              alt="ART LAVKA.UZ"
              width={180}
              height={68}
              className="object-contain"
              priority
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
