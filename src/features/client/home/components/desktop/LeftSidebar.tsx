"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { PrintDesign, PrintCategory } from "@/types";
import { SidebarPrintSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { usePrintsPaginated } from "../../hooks/usePrintsPaginated";
import { usePrintCategories } from "../../hooks/usePrintCategories";

interface LeftSidebarProps {
  onGalleryClick: () => void;
  selectedPrint: PrintDesign | null;
  onPrintSelect: (print: PrintDesign | null) => void;
  initialPrints?: PrintDesign[];
  initialLoading?: boolean;
  printCategories?: PrintCategory[];
}

export default function LeftSidebar({
  onGalleryClick,
  selectedPrint,
  onPrintSelect,
  initialPrints,
  initialLoading,
  printCategories = [],
}: LeftSidebarProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categoriesData = [] } = usePrintCategories();
  const {
    data: printsData,
    isLoading: printsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePrintsPaginated({
    category: selectedCategory,
  });

  const categories = [
    { id: "all", label: t.all },
    ...(categoriesData || printCategories).map((cat) => ({
      id: cat.slug,
      label: getTranslated(cat, lang),
    })),
  ];

  // Flatten all pages into a single list
  const allPrints = printsData?.pages.flatMap((p) => p.prints) ?? [];
  const prints = allPrints.length > 0 ? allPrints : initialPrints || [];
  const loading = printsLoading && prints.length === 0;

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

  const filteredPrints = prints.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const translatedName = getTranslated(p, lang);
    const matchesSearch = translatedName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[558px] h-auto md:h-[calc(100vh-160px)] md:max-h-[886px] flex flex-col shrink-0">
      {/* Logo + Language Dropdown + Gallery Button */}
      <div className="mb-10 hidden md:flex items-center justify-between gap-4 shrink-0">
        <div className="shrink-0 w-[220px]">
          <Image
            src="/art-lavka.png"
            alt="ART-LAVKA.UZ - Эксклюзивные дизайнерские футболки в Узбекистане"
            width={220}
            height={83}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-3 justify-end min-w-[240px]">
          <LanguageSwitcher />
          <Button
            variant="primary"
            size="md"
            onClick={onGalleryClick}
            className="whitespace-nowrap h-[46px] px-6 rounded-xl! shadow-sm hover:shadow-md min-w-[180px]"
          >
            {t.gallery}
          </Button>
        </div>
      </div>

      {/* Track Order Button */}
      <div className="mb-6 shrink-0">
        <a
          href="/track-order"
          className="block w-full py-3 px-6 bg-linear-to-r from-[#8814B1] to-[#a01dc4] hover:from-[#8814B1]/90 hover:to-[#a01dc4]/90 text-center text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          {t.trackOrder}
        </a>
      </div>

      {/* Print Selection */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-[30px]/[37px] text-[#333333] mb-7.5 shrink-0">
          {t.selectPrint}
        </h3>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery("");
              }}
              className={`text-[16px]/[22px] cursor-pointer hover:text-[#8814B1] transition-colors ${
                selectedCategory === cat.id
                  ? "border-b border-[#8814B1]"
                  : "text-[#333333]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-8 shrink-0">
          <input
            type="text"
            placeholder={t.searchPrints}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[50px] bg-white rounded-lg px-4 border border-gray-100 focus:border-[#8814B1] outline-none transition-all shadow-sm"
          />
        </div>

        {/* Print Grid - Scrollable Container */}
        <div className="flex-1 overflow-y-auto pr-2 max-h-[400px]">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {/* No Print Option */}
            <button
              onClick={() => onPrintSelect(null)}
              className={`aspect-square cursor-pointer rounded-[26px] border-2 transition-all hover:shadow-xl flex items-center justify-center ${
                selectedPrint === null
                  ? "border-[#00C6F1] shadow-lg"
                  : "border-gray-200 hover:border-[#00C6F1]/30"
              }`}
            >
              <div className="bg-white h-[90%] w-[90%] rounded-[26px] shadow-lg flex items-center justify-center">
                <span className="text-xs text-gray-500 text-center font-medium">
                  {t.noPrint}
                </span>
              </div>
            </button>

            {loading ? (
              <SidebarPrintSkeleton count={8} />
            ) : (
              filteredPrints.map((print, index) => (
                <button
                  key={print.id || (print as any)._id}
                  onClick={() => onPrintSelect(print)}
                  className={`aspect-square cursor-pointer rounded-[26px] border-2 transition-all hover:shadow-xl flex items-center justify-center ${
                    selectedPrint?.id === print.id ||
                    (selectedPrint as any)?._id === (print as any)._id
                      ? "border-[#00C6F1] shadow-lg"
                      : "border-gray-200 hover:border-[#00C6F1]/30"
                  }`}
                >
                  <div className="relative bg-white h-[90%] w-[90%] rounded-[26px] overflow-hidden shadow-lg">
                    <Image
                      src={print.frontImagePreview || print.frontImage}
                      alt={getTranslated(print, lang)}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 150px"
                      className="object-contain p-3"
                      priority={index < 4}
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
                <p className="text-xs text-gray-400 text-center">{t.allPrintsLoaded ?? "Все принты загружены"}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
