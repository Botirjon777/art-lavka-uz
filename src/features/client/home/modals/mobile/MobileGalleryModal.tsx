"use client";

import { useState, useRef, useCallback } from "react";
import MobileModal from "./MobileModal";
import { Product } from "@/types";
import Image from "next/image";
import { useGalleryPaginated } from "../../hooks/useGalleryPaginated";
import { useTranslation } from "@/hooks/useTranslation";
import ImageLightbox from "../../components/shared/ImageLightbox";

interface GalleryImage {
  _id: string;
  name: string;
  image: string;
  productId?: string;
}

interface MobileGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export default function MobileGalleryModal({
  isOpen,
  onClose,
  onSelectProduct,
}: MobileGalleryModalProps) {
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGalleryPaginated({ enabled: isOpen });

  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const allImages = data?.pages.flatMap((page) => page.data) || [];

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title={t.gallery}>
      <div className="px-4 py-4">
        {/* Loading State */}
        {isLoading && allImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4"></div>
            <p className="text-[#666666] text-sm">{t.loadingGallery}...</p>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
              {allImages.length === 0 && !isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-600">{t.noGalleryImages}</p>
                </div>
              ) : (
                allImages.map((item: GalleryImage, index: number) => (
                  <div key={item._id} className="group text-center">
                    <div 
                      className="relative w-full aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 250px"
                        className="object-cover group-active:scale-95 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm text-[#333333] line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="w-8 h-8 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin" />
              )}
              {!hasNextPage && allImages.length > 0 && (
                <p className="text-xs text-gray-400">{t.allPrintsLoaded}</p>
              )}
            </div>
          </>
        )}
      </div>

      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages.map((item: GalleryImage) => item.image)}
        initialIndex={lightboxIndex}
      />
    </MobileModal>
  );
}
