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
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

function LightboxImageItem({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full max-h-[60vh] md:max-h-[75vh] max-w-[90vw] md:max-w-[80vw] mx-auto flex items-center justify-center">
      {/* Loading Spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain transition-all duration-300 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(max-width: 1024px) 90vw, 30vw"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export default function ImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
  hasNextPage,
  fetchNextPage,
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

  const handlePrev = useCallback((e?: React.MouseEvent | any) => {
    e?.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  const handleNext = useCallback((e?: React.MouseEvent | any) => {
    e?.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);

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
      className={`fixed inset-0 z-9999 bg-black/95 flex flex-col items-center justify-between backdrop-blur-md transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* Header/Close */}
      <div
        className="w-full p-2.5 flex justify-between items-center z-50 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
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
      <div className="relative w-full flex-1 flex items-center justify-center p-0 md:p-10 overflow-hidden">
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
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.activeIndex);
              if (
                hasNextPage &&
                fetchNextPage &&
                swiper.activeIndex >= images.length - 3
              ) {
                fetchNextPage();
              }
            }}
            modules={[Navigation, Pagination]}
            className="w-full h-full"
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            breakpoints={{
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            grabCursor={true}
          >
            {images.map((image, index) => {
              const isActive = index === currentIndex;
              return (
                <SwiperSlide
                  key={index}
                  className="flex items-center justify-center p-2.5"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "opacity-100 scale-100"
                        : "opacity-20 scale-75 blur-[1px] pointer-events-none lg:opacity-45"
                    }`}
                  >
                    <LightboxImageItem
                      src={image}
                      alt={`Gallery Image ${index + 1}`}
                      priority={isActive}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Navigation Buttons - Mobile */}
      <div
        className="lg:hidden w-full flex justify-center gap-10 py-5 z-50 shrink-0 bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
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
    </div>,
    document.body,
  );
}
