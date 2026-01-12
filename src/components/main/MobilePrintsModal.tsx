"use client";

import { useState, useEffect } from "react";
import MobileModal from "./MobileModal";
import { PrintDesign } from "@/types";
import Image from "next/image";

interface MobilePrintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrint: (print: PrintDesign | null) => void;
  selectedPrint: PrintDesign | null;
}

export default function MobilePrintsModal({
  isOpen,
  onClose,
  onSelectPrint,
  selectedPrint,
}: MobilePrintsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [prints, setPrints] = useState<PrintDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPrints();
    }
  }, [isOpen]);

  const fetchPrints = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/prints?limit=100");
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

  const categories = [
    { id: "all", label: "Все" },
    { id: "national", label: "Национальные" },
    { id: "stylish", label: "Стильные" },
    { id: "funny", label: "Прикольные" },
  ];

  const filteredPrints = prints.filter((p) => {
    const matchesCategory = activeTab === "all" || p.category === activeTab;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MobileModal isOpen={isOpen} onClose={onClose}>
      <div className="px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`pb-3 whitespace-nowrap transition-colors text-sm ${
                activeTab === cat.id
                  ? "border-b-2 border-[#8814B1] text-[#8814B1] font-medium"
                  : "text-[#666666]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Поиск принтов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white rounded-lg px-4 border border-gray-200 focus:border-[#8814B1] outline-none transition-all text-sm"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8814B1]/20 border-t-[#8814B1] rounded-full animate-spin mb-4"></div>
            <p className="text-[#666666] text-sm">Загрузка принтов...</p>
          </div>
        ) : (
          <>
            {/* Prints Grid */}
            <div className="grid grid-cols-3 gap-3">
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
                    Без принта
                  </span>
                </div>
              </button>

              {filteredPrints.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600 text-sm">Принты не найдены</p>
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
                        src={print.frontImage}
                        alt={print.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="text-center py-6 text-sm text-gray-500">
              © 2023 - 2025
            </div>
          </>
        )}
      </div>
    </MobileModal>
  );
}
