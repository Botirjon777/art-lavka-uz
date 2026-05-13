"use client";

import { useState, useEffect } from "react";
import MobileModal from "./MobileModal";
import { PrintDesign, PrintCategory } from "@/types";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { usePrints } from "../../hooks/usePrints";
import { usePrintCategories } from "../../hooks/usePrintCategories";

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
  initialPrints,
  initialLoading,
  printCategories = [],
}: MobilePrintsModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const { data: categoriesData = [] } = usePrintCategories({ enabled: isOpen });
  const { data: printsData = [], isLoading: printsLoading } = usePrints({
    enabled: isOpen,
  });

  const categories = [
    { id: "all", label: t.all },
    ...(categoriesData.length > 0 ? categoriesData : printCategories).map(
      (cat) => ({
        id: cat.slug,
        label: getTranslated(cat, lang),
      }),
    ),
  ];
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const prints = printsData.length > 0 ? printsData : initialPrints || [];
  const loading =
    (printsLoading || (isOpen && printsData.length === 0)) &&
    prints.length === 0;

  const filteredPrints = prints.filter((p) => {
    const matchesCategory = activeTab === "all" || p.category === activeTab;
    const translatedName = getTranslated(p, lang);
    const matchesSearch = translatedName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MobileModal isOpen={isOpen} onClose={onClose}>
      <div className="pt-16">
        {/* Tabs */}
        <div className="flex px-5 gap-2.5 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`whitespace-nowrap transition-colors text-[13px]/[16px] ${
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

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4"></div>
            <p className="text-[#666666] text-sm">{t.loadingPrints}...</p>
          </div>
        ) : (
          <>
            {/* Prints Grid */}
            <div className="grid grid-cols-3 gap-3 px-5 max-h-[60vh] overflow-y-auto pb-6">
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

              {filteredPrints.length === 0 ? (
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
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </MobileModal>
  );
}
