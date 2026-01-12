"use client";

import { useState, useEffect } from "react";
import MobileModal from "./MobileModal";
import { Product } from "@/types";
import Image from "next/image";
import { MobileFooter } from "../MobileFooter";

interface MobileProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function MobileProductsModal({
  isOpen,
  onClose,
  onSelectProduct,
}: MobileProductsModalProps) {
  const [activeTab, setActiveTab] = useState<"women" | "men" | "kids">("women");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "women" as const, label: "Женский", soon: false },
    { id: "men" as const, label: "Мужской", soon: true },
    { id: "kids" as const, label: "Детский", soon: true },
  ];

  return (
    <MobileModal isOpen={isOpen} onClose={onClose}>
      <div className="px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.soon && setActiveTab(tab.id)}
              className={`pb-3 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#8814B1] text-[#8814B1]"
                  : "text-[#666666]"
              } ${tab.soon ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={tab.soon}
            >
              <span className="font-medium">{tab.label}</span>
              {tab.soon && (
                <span className="text-xs ml-1 text-[#8814B1]">- Скоро</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4"></div>
            <p className="text-[#666666] text-sm">Загрузка продуктов...</p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
              {products.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-600">Нет доступных продуктов</p>
                </div>
              ) : (
                products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-3/4 mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-active:scale-95 transition-transform duration-200"
                      />
                      {product.isNew && (
                        <div className="absolute top-2 right-2 bg-[#00C6F1] text-white text-xs font-bold px-2 py-1 rounded">
                          New
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#333333] font-medium line-clamp-2">
                      {product.name}
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <MobileFooter />
          </>
        )}
      </div>
    </MobileModal>
  );
}
