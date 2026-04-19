"use client";

import { useState } from "react";
import MobileModal from "./MobileModal";
import { Product } from "@/types";
import Image from "next/image";
import { useGallery } from "../../hooks/useGallery";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { data: gallery = [], isLoading: loading } = useGallery();

  return (
    <MobileModal isOpen={isOpen} onClose={onClose}>
      <div className="px-4 py-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-[#333333] mb-6">{t.gallery}</h2>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4"></div>
            <p className="text-[#666666] text-sm">{t.loadingGallery}...</p>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
              {gallery.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-600">{t.noGalleryImages}</p>
                </div>
              ) : (
                gallery.map((item) => (
                  <div key={item._id} className="group text-center">
                    <div className="relative w-full aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 250px"
                        className="object-cover group-active:scale-95 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-sm text-[#333333] line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </MobileModal>
  );
}
