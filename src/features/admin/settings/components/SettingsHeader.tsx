"use client";

import { FiSettings } from "react-icons/fi";

interface SettingsHeaderProps {
  activeTab: "categories" | "menu";
  setActiveTab: (tab: "categories" | "menu") => void;
}

export default function SettingsHeader({
  activeTab,
  setActiveTab,
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-md shadow-sm border border-gray-100">
      <div>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <FiSettings className="text-[#8814B1]" />
          Настройки сайта
        </h1>
        <p className="text-gray-500 mt-1">
          Управление категориями и контентом модальных окон
        </p>
      </div>

      <div className="relative flex bg-gray-100 p-1 rounded-md min-w-[320px]">
        {/* Sliding background indicator */}
        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out ${
            activeTab === "menu" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        
        <button
          onClick={() => setActiveTab("categories")}
          className={`relative z-10 flex-1 px-6 py-2.5 rounded-md font-bold transition-colors duration-300 ${
            activeTab === "categories"
              ? "text-[#8814B1]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Категории
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`relative z-10 flex-1 px-6 py-2.5 rounded-md font-bold transition-colors duration-300 ${
            activeTab === "menu"
              ? "text-[#8814B1]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Контент меню
        </button>
      </div>
    </div>
  );
}
