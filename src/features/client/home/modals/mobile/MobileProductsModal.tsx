"use client";

import { useState, useEffect } from "react";
import MobileModal from "./MobileModal";
import { Product } from "@/types";
import Image from "next/image";
import { useProducts } from "../../hooks/useProducts";
import { useSettings } from "../../hooks/useSettings";
import { FiAlertTriangle } from "react-icons/fi";

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
  const { data: products = [], isLoading: loading } = useProducts();
  const { data: settings } = useSettings();
  
  const [activeTab, setActiveTab] = useState<string>("");

  const categories = settings?.categories || [
    { id: "women", label: "Женский", status: "active" },
    { id: "men", label: "Мужской", status: "soon" },
    { id: "kids", label: "Детский", status: "soon" },
  ];

  const tabs = categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    soon: cat.status === "soon",
  }));

  const allSoon = tabs.every((tab) => tab.soon);

  // Auto-select first active tab when settings load
  useEffect(() => {
    if (settings && settings.categories?.length > 0) {
      const firstActive = settings.categories.find((cat: any) => cat.status === "active");
      if (firstActive) {
        setActiveTab(firstActive.id);
      } else {
        // Fallback to first tab if none are active
        setActiveTab(settings.categories[0].id);
      }
    } else if (!settings) {
       // Initial default if settings haven't loaded
       setActiveTab("women");
    }
  }, [settings]);

  return (
    <MobileModal isOpen={isOpen} onClose={onClose}>
      <div className="px-5 pt-16">
        {/* Tabs */}
        <div className="flex gap-2.5 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.soon && setActiveTab(tab.id)}
              className={`whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#8814B1] text-[#8814B1]"
                  : "text-[#666666]"
              } ${tab.soon ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={tab.soon}
            >
              <span className="text-[13px]/[16px]">{tab.label}</span>
              {tab.soon && (
                <span className="text-[13px]/[16px] ml-1 text-[#8814B1]">
                  - Скоро
                </span>
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
        ) : allSoon ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-5">
            <div className="p-4 bg-purple-50 rounded-full mb-5">
              <FiAlertTriangle className="w-12 h-12 text-[#8814B1]" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Извините, продуктов нет
            </h3>
            <p className="text-gray-500 text-sm">
              Все категории временно недоступны. Пожалуйста, зайдите позже или следите за обновлениями!
            </p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const filteredProducts = products.filter(
                  (product) => product.category === activeTab,
                );

                if (filteredProducts.length === 0) {
                  return (
                    <div className="col-span-2 text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm">Нет доступных товаров</p>
                    </div>
                  );
                }

                return filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-3/4 mb-2 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-active:scale-95 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-sm text-[#333333] font-medium line-clamp-2">
                      {product.name}
                    </p>
                  </button>
                ));
              })()}
            </div>
          </>
        )}
      </div>
    </MobileModal>
  );
}
