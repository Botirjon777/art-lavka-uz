"use client";

import { useState, useEffect } from "react";
import MobileModal from "./MobileModal";
import { Product, ICategory } from "@/types";
import Image from "next/image";
import { useProducts } from "../../hooks/useProducts";
import { useSettings } from "../../hooks/useSettings";
import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

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
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const { data: products = [], isLoading: loading } = useProducts({ enabled: isOpen });
  const { data: settings } = useSettings({ enabled: isOpen });

  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedProductInfo, setSelectedProductInfo] =
    useState<Product | null>(null);

  const categories: ICategory[] = settings?.categories || [
    { id: "women", label: "Женский", status: "active" },
    { id: "men", label: "Мужской", status: "soon" },
    { id: "kids", label: "Детский", status: "soon" },
  ];

  const tabs = categories.map((cat: ICategory) => ({
    id: cat.id,
    label: getTranslated(cat, lang, "label") || cat.label,
    soon: cat.status === "soon",
  }));

  const allSoon = tabs.every((tab: { soon: boolean }) => tab.soon);

  // Auto-select first active tab when settings load
  useEffect(() => {
    if (settings && settings.categories?.length > 0) {
      const firstActive = settings.categories.find(
        (cat: ICategory) => cat.status === "active",
      );
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
          {tabs.map((tab: { id: string; label: string; soon: boolean }) => (
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
              Все категории временно недоступны. Пожалуйста, зайдите позже или
              следите за обновлениями!
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
                      <p className="text-gray-400 text-sm">
                        Нет доступных товаров
                      </p>
                    </div>
                  );
                }

                return filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group text-center flex flex-col items-center"
                  >
                    <div
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="relative w-full aspect-3/4 mb-2 overflow-hidden rounded-xl active:scale-95 transition-transform"
                    >
                      <Image
                        src={product.image}
                        alt={getTranslated(product, lang)}
                        fill
                        sizes="(max-width: 768px) 50vw, 200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 w-full px-1">
                      <p
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="text-sm text-[#333333] font-medium line-clamp-1 flex-1 text-center"
                      >
                        {getTranslated(product, lang)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductInfo(product);
                        }}
                        className="text-gray-400 p-1 active:text-[#8814B1]"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full px-1">
                      {(() => {
                        const firstColor =
                          product.colors?.find((c) =>
                            c.variants?.some((v) => v.stock > 0),
                          ) || product.colors?.[0];
                        const firstVariant =
                          firstColor?.variants?.find((v) => v.stock > 0) ||
                          firstColor?.variants?.[0];

                        if (!firstVariant) return null;

                        const currentPrice =
                          firstVariant.promoPrice || firstVariant.price;
                        const hasPromo =
                          firstVariant.promoPrice &&
                          firstVariant.promoPrice > 0 &&
                          firstVariant.oldPrice &&
                          firstVariant.oldPrice > firstVariant.promoPrice;
                        const displayOldPrice = hasPromo
                          ? firstVariant.oldPrice
                          : firstVariant.oldPrice &&
                              firstVariant.oldPrice > firstVariant.price
                            ? firstVariant.oldPrice
                            : null;

                        return (
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <span className="text-[12px] text-gray-500">
                              {firstVariant.size}
                            </span>
                            <span
                              className={`text-[13px] font-bold ${hasPromo ? "text-[#8814B1]" : "text-[#333333]"}`}
                            >
                              {currentPrice.toLocaleString()} {t.currency}
                            </span>
                            {displayOldPrice && (
                              <span className="text-[11px] text-gray-400 line-through">
                                {displayOldPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>

      {/* Mobile Description Modal */}
      {selectedProductInfo && (
        <div className="fixed inset-0 z-110 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProductInfo(null)}
          />
          <div className="relative bg-white rounded-t-[30px] w-full max-h-[85vh] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <button
              onClick={() => setSelectedProductInfo(null)}
              className="absolute top-6 right-6 text-gray-400 text-2xl"
            >
              ×
            </button>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#333333]">
                {getTranslated(selectedProductInfo, lang)}
              </h3>
              <p className="text-[#666666] text-sm leading-relaxed pb-10">
                {getTranslated(selectedProductInfo, lang, "description") ||
                  t.noDescription}
              </p>
            </div>
          </div>
        </div>
      )}
    </MobileModal>
  );
}
