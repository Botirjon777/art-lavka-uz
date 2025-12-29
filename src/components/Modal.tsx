"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "left" | "right" | "center";
  title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  position = "center",
  title,
}: ModalProps) {
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

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "left-0 top-0 h-full w-full max-w-[1600px] animate-slide-in-left";
      case "right":
        return "right-0 top-0 h-full w-full max-w-[1600px] animate-slide-in-right";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1600px] max-h-[90vh] animate-fade-in";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-lg shadow-2xl overflow-hidden ${getPositionClasses()}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-lg"
          aria-label="Close modal"
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

        {/* Title */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-purple-600 to-purple-700">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div
          className={`${
            position === "center"
              ? "overflow-y-auto max-h-[calc(90vh-80px)]"
              : "h-full overflow-y-auto"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
