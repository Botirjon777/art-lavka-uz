"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PrintDesign, ConfiguratorState } from "@/types";
import { SidebarPrintSkeleton } from "../LoadingSkeleton";

interface LeftSidebarProps {
  onGalleryClick: () => void;
  selectedPrint: PrintDesign | null;
  onPrintSelect: (print: PrintDesign | null) => void;
}

const categories = [
  { id: "all", label: "Все" },
  { id: "national", label: "Национальные" },
  { id: "stylish", label: "Стильные" },
  { id: "funny", label: "Прикольные" },
];

export default function LeftSidebar({
  onGalleryClick,
  selectedPrint,
  onPrintSelect,
}: LeftSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [prints, setPrints] = useState<PrintDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrints();
  }, []);

  const fetchPrints = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/prints?limit=100", {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      const data = await response.json();
      if (data.success) {
        setPrints(data.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (error) {
      console.error("Error fetching prints:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrints = prints.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[558px] h-full px-6 flex flex-col">
      {/* Logo */}
      <div className="mb-4 flex justify-between items-center gap-6">
        <Image
          src="/art-lavka.png"
          alt="ART LAVKA.UZ"
          width={262}
          height={99}
          className="object-contain"
        />
        <button
          onClick={onGalleryClick}
          className="py-[15px] px-[35px] bg-[#00C6F1] hover:bg-[#00C6F1]/80 cursor-pointer text-[16px]/5 text-white font-medium rounded-lg transition-colors shadow-md whitespace-nowrap"
        >
          Фото Галерея
        </button>
      </div>

      {/* Track Order Button */}
      <div className="mb-6">
        <a
          href="/track-order"
          className="block w-full py-3 px-6 bg-linear-to-r from-[#8814B1] to-[#a01dc4] hover:from-[#8814B1]/90 hover:to-[#a01dc4]/90 text-center text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Отследить заказ
        </a>
      </div>

      {/* Print Selection */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-[30px]/[37px] text-[#333333] mb-7.5">
          Выберите принт
        </h3>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[16px]/[22px] cursor-pointer hover:text-[#333333]/80 transition-colors ${
                selectedCategory === cat.id
                  ? "underline text-[#333333]"
                  : "text-[#333333]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Поиск принтов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[50px] bg-white rounded-lg px-4"
          />
        </div>

        {/* Print Grid - Scrollable */}
        <div className="w-full">
          <div className="grid grid-cols-4 gap-3 pb-4">
            {/* No Print Option */}
            <button
              onClick={() => onPrintSelect(null)}
              className={`w-[134px] h-[134px] cursor-pointer rounded-[26px] border-2 transition-all hover:scale-105 flex items-center justify-center ${
                selectedPrint === null
                  ? "border-[#00C6F1]"
                  : "border-transparent"
              }`}
            >
              <div className="bg-white h-[110px] w-[110px] rounded-[26px] shadow-lg flex items-center justify-center">
                <span className="text-xs text-gray-500 text-center">
                  Без принта
                </span>
              </div>
            </button>

            {loading ? (
              <SidebarPrintSkeleton count={8} />
            ) : (
              filteredPrints.map((print) => (
                <button
                  key={print.id || (print as any)._id}
                  onClick={() => onPrintSelect(print)}
                  className={`w-[134px] h-[134px] cursor-pointer rounded-[26px] border-2 transition-all hover:scale-105 flex items-center justify-center ${
                    selectedPrint?.id === print.id ||
                    (selectedPrint as any)?._id === (print as any)._id
                      ? "border-[#00C6F1]"
                      : "border-transparent"
                  }`}
                >
                  <div className="relative bg-white h-[110px] w-[110px] rounded-[26px] overflow-hidden shadow-lg">
                    <Image
                      src={print.frontImage}
                      alt={print.name}
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
