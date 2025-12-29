"use client";

import { useState } from "react";
import Image from "next/image";
import { PrintDesign, ConfiguratorState } from "@/types";

interface LeftSidebarProps {
  onGalleryClick: () => void;
  selectedPrint: PrintDesign | null;
  onPrintSelect: (print: PrintDesign | null) => void;
}

// Mock print designs
const printDesigns: PrintDesign[] = [
  { id: "p1", name: "Кот", image: "/prints/cat.png", category: "funny" },
  {
    id: "p4",
    name: "Гарфилд",
    image: "/prints/garfield.png",
    category: "stylish",
  },
  { id: "p5", name: "Кролик", image: "/prints/rabbit.png", category: "funny" },
  { id: "p6", name: "Микки", image: "/prints/mickey.png", category: "funny" },
  { id: "p7", name: "Губы", image: "/prints/lips.png", category: "stylish" },
  { id: "p8", name: "Муха", image: "/prints/fly.png", category: "funny" },
  { id: "p10", name: "Медведь", image: "/prints/bear.png", category: "funny" },
];

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

  const filteredPrints =
    selectedCategory === "all"
      ? printDesigns
      : printDesigns.filter((p) => p.category === selectedCategory);

  return (
    <div className="w-full max-w-[558px] h-full px-6 flex flex-col">
      {/* Logo */}
      <div className="mb-6 flex justify-between items-center gap-6">
        <Image
          src="/art-lavka.png"
          alt="ART LAVKA.UZ"
          width={262}
          height={99}
          className="object-contain"
        />
        <button
          onClick={onGalleryClick}
          className="py-[15px] px-[35px] bg-[#00C6F1] hover:bg-[#00C6F1]/80 cursor-pointer text-[16px]/5 text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Фото Галерея
        </button>
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
              className={`px-3 py-1.5 text-[16px]/[22px] transition-colors ${
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
            className="w-full h-[50px] bg-white rounded-lg px-4"
          />
        </div>

        {/* Print Grid - Scrollable */}
        <div className="w-full">
          <div className="grid grid-cols-4 gap-3 pb-4">
            {/* No Print Option */}
            <button
              onClick={() => onPrintSelect(null)}
              className={`w-[134px] h-[134px] rounded-[26px] border-2 transition-all hover:scale-105 flex items-center justify-center ${
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

            {filteredPrints.map((print) => (
              <button
                key={print.id}
                onClick={() => onPrintSelect(print)}
                className={`w-[134px] h-[134px] rounded-[26px] border-2 transition-all hover:scale-105 flex items-center justify-center ${
                  selectedPrint?.id === print.id
                    ? "border-[#00C6F1]"
                    : "border-transparent"
                }`}
              >
                <div className="relative bg-white h-[110px] w-[110px] rounded-[26px] overflow-hidden shadow-lg">
                  <Image
                    src={print.image}
                    alt={print.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
