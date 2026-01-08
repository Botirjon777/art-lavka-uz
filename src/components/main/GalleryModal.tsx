"use client";

import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Product } from "@/types";
import Image from "next/image";

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
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchGallery();
    }
  }, [isOpen]);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();

      if (data.success) {
        setGallery(data.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <div className="w-[1500px] flex items-center justify-center h-[600px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin"></div>
            <p className="text-[#666666] text-sm">Загрузка галереи...</p>
          </div>
        </div>
      ) : (
        <div className="w-[1500px]">
          <h2 className="text-[30px]/[37px] text-[#333333] mb-7.5">Галерея</h2>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {gallery.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No gallery images available</p>
              </div>
            ) : (
              gallery.map((item) => (
                <div
                  key={item._id}
                  className="group text-center cursor-pointer"
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct({
                        id: item._id,
                        name: item.name,
                        image: item.image,
                        category: "women",
                        price: 100000,
                        model: "/model/compressed/base.glb",
                        stock: 100,
                      });
                      onClose();
                    }
                  }}
                >
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
        </div>
      )}
    </Modal>
  );
}
