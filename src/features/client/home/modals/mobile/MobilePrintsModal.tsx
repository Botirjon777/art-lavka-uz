"use client";

import { useRef, useCallback, useState } from "react";
import MobileModal from "./MobileModal";
import { PrintDesign, PrintCategory } from "@/types";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { usePrintCategories } from "../../hooks/usePrintCategories";
import { usePrintsPaginated } from "../../hooks/usePrintsPaginated";

interface MobilePrintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrint: (print: PrintDesign | null) => void;
  selectedPrint: PrintDesign | null;
  initialPrints?: PrintDesign[];
  initialLoading?: boolean;
  printCategories?: PrintCategory[];
}

export default function MobilePrintsModal({
  isOpen,
  onClose,
  onSelectPrint,
  selectedPrint,
  printCategories = [],
}: MobilePrintsModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoriesData = [] } = usePrintCategories({ enabled: isOpen });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePrintsPaginated({
    enabled: isOpen,
    category: activeTab,
  });

  // Flatten all pages into a single list
  const allPrints = data?.pages.flatMap((p) => p.prints) ?? [];

  // Filter by search query
  const filteredPrints = allPrints.filter((p) => {
    const translatedName = getTranslated(p, lang);
    return translatedName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    { id: "all", label: t.all },
    ...(categoriesData.length > 0 ? categoriesData : printCategories).map((cat) => ({
      id: cat.slug,
      label: getTranslated(cat, lang),
    })),
  ];

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchQuery("");
  };

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title={t.selectPrint}>
      <div className="pt-4">
        {/* Tabs */}
        <div className="flex px-5 gap-2.5 mb-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={`whitespace-nowrap transition-colors text-[13px]/[16px] shrink-0 ${
                activeTab === cat.id
                  ? "border-b border-[#8814B1] text-[#8814B1]"
                  : "text-[#666666]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-4 px-5">
          <input
            type="text"
            placeholder={t.searchPrints}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white rounded-lg px-4 border border-gray-200 focus:border-[#8814B1] outline-none transition-all text-sm"
          />
        </div>

        {/* Initial Loading State */}
        {isLoading && allPrints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4" />
            <p className="text-[#666666] text-sm">{t.loadingPrints}...</p>
          </div>
        ) : (
          <>
            {/* Prints Grid */}
            <div className="grid grid-cols-3 gap-3 px-5 pb-6">
              {/* No Print Option */}
              <button
                onClick={() => {
                  onSelectPrint(null);
                  onClose();
                }}
                className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                  selectedPrint === null
                    ? "border-[#00C6F1] bg-[#00C6F1]/5"
                    : "border-gray-200"
                }`}
              >
                <div className="bg-white h-[85%] w-[85%] rounded-xl shadow-sm flex items-center justify-center">
                  <span className="text-xs text-gray-500 text-center font-medium px-2">
                    {t.noPrint}
                  </span>
                </div>
              </button>

              {filteredPrints.length === 0 && !isLoading ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600 text-sm">{t.noPrintsFound}</p>
                </div>
              ) : (
                filteredPrints.map((print) => (
                  <button
                    key={print.id || (print as any)._id}
                    onClick={() => {
                      onSelectPrint(print);
                      onClose();
                    }}
                    className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                      selectedPrint?.id === print.id ||
                      (selectedPrint as any)?._id === (print as any)._id
                        ? "border-[#00C6F1] bg-[#00C6F1]/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="relative bg-white h-[85%] w-[85%] rounded-xl overflow-hidden shadow-sm">
                      <Image
                        src={print.frontImagePreview || print.frontImage}
                        alt={getTranslated(print, lang)}
                        fill
                        sizes="(max-width: 768px) 33vw, 120px"
                        className="object-contain p-2"
                        loading="lazy"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            {!searchQuery && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <div className="w-8 h-8 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin" />
                )}
                {!hasNextPage && allPrints.length > 0 && (
                  <p className="text-xs text-gray-400">{t.allPrintsLoaded ?? "Все принты загружены"}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MobileModal>
  );
}
