"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { Product } from "@/types";
import Image from "next/image";
import { useGallery } from "../../hooks/useGallery";
import { useTranslation } from "@/hooks/useTranslation";
import ImageLightbox from "../../components/shared/ImageLightbox";

interface GalleryImage {
  _id: string;
  name: string;
  image: string;
  productId?: string;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export default function GalleryModal({
  isOpen,
  onClose,
  onSelectProduct,
}: GalleryModalProps) {
  const { t } = useTranslation();
  const { data: gallery = [], isLoading: loading } = useGallery({ enabled: isOpen });
  
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px] max-w-full min-h-[600px]">
        {loading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin"></div>
              <p className="text-[#666666] text-sm">{t.loadingGallery}...</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-[30px]/[37px] text-[#333333] mb-7.5">{t.gallery}</h2>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 modal-scrollbar overflow-y-auto max-h-[600px]">
            {gallery.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">{t.noGalleryImages}</p>
              </div>
            ) : (
              gallery.map((item, index) => (
                <div key={item._id} className="group text-center">
                  <div 
                    className="relative aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1200px) 25vw, 210px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-[16px]/[22px] text-[#333333]">
                    {item.name}
                  </p>
                </div>
              ))
            )}
            </div>
          </>
        )}
      </div>

      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={gallery.map((item) => item.image)}
        initialIndex={lightboxIndex}
      />
    </Modal>
  );
}
