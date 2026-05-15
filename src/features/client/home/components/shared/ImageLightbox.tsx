"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      // Small delay to trigger entry animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, initialIndex]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    },
    [images.length],
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    },
    [images.length],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 bg-black/95 flex flex-col items-center justify-center backdrop-blur-md transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* Header/Close */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <div className="text-white/50 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
        >
          <FiX size={28} />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-20">
        {/* Navigation Buttons - Desktop */}
        <button
          onClick={handlePrev}
          className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all z-10 hover:scale-110 active:scale-90"
        >
          <FiChevronLeft size={40} />
        </button>

        <button
          onClick={handleNext}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all z-10 hover:scale-110 active:scale-90"
        >
          <FiChevronRight size={40} />
        </button>

        {/* Image Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full max-h-[85vh] md:max-h-[90vh] transition-all duration-300">
            <Image
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Gallery Image ${currentIndex + 1}`}
              fill
              className="object-contain animate-in fade-in zoom-in duration-300"
              priority
              sizes="100vw"
            />
          </div>
        </div>

        {/* Navigation Buttons - Mobile */}
        <div className="lg:hidden absolute bottom-10 left-0 w-full flex justify-center gap-10 z-10">
          <button
            onClick={handlePrev}
            className="p-4 bg-white/10 rounded-full text-white active:bg-white/20 active:scale-90 transition-all"
          >
            <FiChevronLeft size={30} />
          </button>
          <button
            onClick={handleNext}
            className="p-4 bg-white/10 rounded-full text-white active:bg-white/20 active:scale-90 transition-all"
          >
            <FiChevronRight size={30} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
