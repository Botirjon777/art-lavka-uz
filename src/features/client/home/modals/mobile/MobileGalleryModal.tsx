"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MobileModal from "./MobileModal";
import { Product } from "@/types";
import Image from "next/image";
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

const fetchAllGallery = async (): Promise<GalleryImage[]> => {
  const response = await fetch("/api/gallery?limit=1000");
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch gallery");
  }
  return data.data;
};

function GalleryImageItem({
  item,
  index,
  onImageClick,
}: {
  item: GalleryImage;
  index: number;
  onImageClick: (index: number) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group text-center">
      <div
        className="relative w-full aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={() => onImageClick(index)}
      >
        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="w-8 h-8 border-3 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 250px"
          className={`object-cover group-active:scale-95 transition-all duration-300 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <p className="text-sm text-[#333333] line-clamp-2">
        {item.name}
      </p>
    </div>
  );
}

export default function MobileGalleryModal({
  isOpen,
  onClose,
  onSelectProduct,
}: MobileGalleryModalProps) {
  const { t } = useTranslation();

  const { data: allImages = [], isLoading } = useQuery({
    queryKey: ["gallery-all"],
    queryFn: fetchAllGallery,
    enabled: isOpen,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.gallery}
      showFooter={false}
    >
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
            <div className="grid grid-cols-2 gap-4 pb-10">
              {allImages.length === 0 && !isLoading ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-600">{t.noGalleryImages}</p>
                </div>
              ) : (
                allImages.map((item: GalleryImage, index: number) => (
                  <GalleryImageItem
                    key={item._id}
                    item={item}
                    index={index}
                    onImageClick={handleImageClick}
                  />
                ))
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
        hasNextPage={false}
        fetchNextPage={() => {}}
      />
    </MobileModal>
  );
}
