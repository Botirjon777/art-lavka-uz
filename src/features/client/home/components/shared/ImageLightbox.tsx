"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useScrollLock } from "@/hooks/useScrollLock";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  const swiperRef = useRef<any>(null);

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
    (e?: React.MouseEvent | any) => {
      e?.stopPropagation();
      if (swiperRef.current) {
        swiperRef.current.slidePrev();
      }
    },
    [],
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent | any) => {
      e?.stopPropagation();
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    },
    [],
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
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
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
      <div className="relative w-full h-full flex items-center justify-center p-0 md:p-20 overflow-hidden">
        {/* Navigation Buttons - Desktop */}
        <button
          onClick={handlePrev}
          className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <FiChevronLeft size={40} />
        </button>

        <button
          onClick={handleNext}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <FiChevronRight size={40} />
        </button>

        {/* Swiper Image Gallery */}
        <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
          <Swiper
            initialSlide={initialIndex}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            modules={[Navigation, Pagination]}
            className="w-full h-full"
            spaceBetween={50}
            slidesPerView={1}
            grabCursor={true}
          >
            {images.map((image, index) => (
              <SwiperSlide 
                key={index} 
                className="flex items-center justify-center p-4"
              >
                <div className="relative w-full h-full max-h-[85vh] md:max-h-[90vh]">
                  <Image
                    src={image}
                    alt={`Gallery Image ${index + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Navigation Buttons - Mobile */}
        <div className="lg:hidden absolute bottom-10 left-0 w-full flex justify-center gap-10 z-50">
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

