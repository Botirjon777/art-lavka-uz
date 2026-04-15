"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
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
  const { data: gallery = [], isLoading: loading } = useGallery();

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {gallery.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">{t.noGalleryImages}</p>
              </div>
            ) : (
              gallery.map((item) => (
                <div key={item._id} className="group text-center">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={210}
                      height={200}
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
      
    </Modal>
  );
}
