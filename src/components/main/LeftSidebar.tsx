"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PrintDesign, ConfiguratorState } from "@/types";
import { SidebarPrintSkeleton } from "../LoadingSkeleton";
import { Button } from "@/components/ui";

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
    <div className="w-full max-w-[558px] h-auto md:h-[calc(100vh-160px)] md:max-h-[886px] px-3 md:px-6 flex flex-col shrink-0">
      {/* Logo */}
      <div className="mb-4 hidden md:flex justify-between items-center gap-6 shrink-0">
        <Image
          src="/art-lavka.png"
          alt="ART LAVKA.UZ"
          width={262}
          height={99}
          className="object-contain"
        />
        <Button
          variant="primary"
          size="lg"
          onClick={onGalleryClick}
          className="whitespace-nowrap"
        >
          Фото Галерея
        </Button>
      </div>

      {/* Track Order Button */}
      <div className="mb-6 shrink-0">
        <a
          href="/track-order"
          className="block w-full py-3 px-6 bg-linear-to-r from-[#8814B1] to-[#a01dc4] hover:from-[#8814B1]/90 hover:to-[#a01dc4]/90 text-center text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Отследить заказ
        </a>
      </div>

      {/* Print Selection */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-[30px]/[37px] text-[#333333] mb-7.5 shrink-0">
          Выберите принт
        </h3>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
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
            placeholder="Поиск принтов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[50px] bg-white rounded-lg px-4 border border-gray-100 focus:border-[#8814B1] outline-none transition-all shadow-sm"
          />
        </div>

        {/* Print Grid - Scrollable Container */}
        <div
          className="flex-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#8814B1 transparent",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
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
                  className={`aspect-square cursor-pointer rounded-[26px] border-2 transition-all hover:shadow-xl flex items-center justify-center ${
                    selectedPrint?.id === print.id ||
                    (selectedPrint as any)?._id === (print as any)._id
                      ? "border-[#00C6F1] shadow-lg"
                      : "border-gray-200 hover:border-[#00C6F1]/30"
                  }`}
                >
                  <div className="relative bg-white h-[90%] w-[90%] rounded-[26px] overflow-hidden shadow-lg">
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
