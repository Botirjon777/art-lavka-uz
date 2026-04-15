"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Product, ICategory } from "@/types";
import Image from "next/image";
import Tooltip from "@/components/ui/Tooltip";
import { CiCircleQuestion } from "react-icons/ci";
import { useProducts } from "../../hooks/useProducts";
import { useSettings } from "../../hooks/useSettings";
import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductsModal({
  isOpen,
  onClose,
  onSelectProduct,
}: ProductsModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const { data: products = [], isLoading: loading } = useProducts();
  const { data: settings } = useSettings();
  
  const [activeTab, setActiveTab] = useState<string>("");

  const categories: ICategory[] = settings?.categories || [
    { id: "women", label: "Женский", status: "active" },
    { id: "men", label: "Мужской", status: "soon" },
    { id: "kids", label: "Детский", status: "soon" },
  ];

  const tabs = categories.map((cat: ICategory) => ({
    id: cat.id,
    label: getTranslated(cat, lang) || cat.label,
    soon: cat.status === "soon",
  }));

  const allSoon = tabs.every((tab: { soon: boolean }) => tab.soon);

  // Auto-select first active tab when settings load
  useEffect(() => {
    if (settings && settings.categories?.length > 0) {
      const firstActive = settings.categories.find((cat: ICategory) => cat.status === "active");
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px] max-w-full min-h-[600px]">
        {loading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin"></div>
              <p className="text-[#666666] text-sm">...</p>
            </div>
          </div>
        ) : allSoon ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
            <div className="p-6 bg-purple-50 rounded-full mb-6">
              <FiAlertTriangle className="w-16 h-16 text-[#8814B1]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Извините, продуктов нет
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto text-lg">
              Все категории временно недоступны. Пожалуйста, зайдите позже или следите за обновлениями!
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-[30px]/[37px] text-[#333333] mb-7.5">{t.selectProduct}</h2>

            {/* Tabs */}
            <div className="flex gap-10 mb-7.5 border-b border-gray-200">
              {tabs.map((tab: { id: string; label: string; soon: boolean }) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`transition-colors cursor-pointer relative py-2 ${
                    activeTab === tab.id
                      ? "text-[#333333] font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  } ${tab.soon ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={tab.soon}
                >
                  {tab.label}
                  {tab.soon && <span className="text-[#8814B1]"> - Скоро</span>}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#333333]" />
                  )}
                </button>
              ))}
            </div>
 
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 pb-10">
              {(() => {
                const filteredProducts = products.filter(
                  (product) => product.category === activeTab,
                );
                
                if (filteredProducts.length === 0) {
                  return (
                    <div className="col-span-full text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">Нет доступных товаров в этой категории</p>
                    </div>
                  );
                }

                return filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col items-center"
                  >
                    <button
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="w-full text-center cursor-pointer"
                    >
                      <div className="relative w-full aspect-3/4 mb-[10px] overflow-hidden rounded-2xl">
                        <Image
                          src={product.image}
                          alt={getTranslated(product, lang)}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </div>
                      <Tooltip
                        content={getTranslated(product, lang, "description") || t.noDescription}
                        position="top"
                      >
                        <div className="flex flex-col items-center gap-1 group cursor-help">
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-[16px]/[22px] text-[#333333] font-medium group-hover:text-[#8814B1] transition-colors">
                              {getTranslated(product, lang)}
                            </p>
                            <CiCircleQuestion
                              size={20}
                              className="text-gray-400 group-hover:text-[#8814B1] transition-colors"
                            />
                          </div>
                          {/* Price Display */}
                          <div className="flex items-center gap-2">
                            <span className={`text-[15px] font-semibold ${product.promoPrice ? "text-[#8814B1]" : "text-[#333333]"}`}>
                              {(product.promoPrice || product.price).toLocaleString()} {t.currency}
                            </span>
                            {product.promoPrice && (
                              <span className="text-[13px] text-gray-400 line-through">
                                {product.price.toLocaleString()} {t.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </Tooltip>
                    </button>
                  </div>
                ));
              })()}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
