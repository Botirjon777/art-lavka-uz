"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
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
    <div className="absolute left-1/2 top-1/2 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-[1600px] max-h-[886px] overflow-hidden animate-slide-in-top bg-image z-10">
        <div className="max-h-[886px] p-10">{children}</div>
      </div>
    </div>
  );
}
