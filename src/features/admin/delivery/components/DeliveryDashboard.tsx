"use client";

import { useState } from "react";
import ZoneTable from "./ZoneTable";
import PriceTable from "./PriceTable";
import { FiMap, FiDollarSign, FiClock } from "react-icons/fi";

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState<"zones" | "prices">("zones");

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Тарифы Доставки</h1>
          <p className="text-gray-500 mt-1">Официальные тарифы BTS Express для Узбекистана</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab("zones")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "zones" 
                ? "bg-[#8814B1] text-white shadow-md shadow-purple-100" 
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FiMap size={18} />
            Матрица зон
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "prices" 
                ? "bg-[#8814B1] text-white shadow-md shadow-purple-100" 
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <FiDollarSign size={18} />
            Цены по весу
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === "zones" ? <ZoneTable /> : <PriceTable />}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
             <FiClock size={24} />
           </div>
           <h3 className="font-bold text-gray-800 mb-1">Сроки доставки</h3>
           <p className="text-sm text-gray-500">В среднем от 2 до 3 рабочих дней между основными городами Узбекистана.</p>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
             <FiMap size={24} />
           </div>
           <h3 className="font-bold text-gray-800 mb-1">Широкий охват</h3>
           <p className="text-sm text-gray-500">Доставка доступна во все областные центры и крупные города Республики.</p>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
             <FiDollarSign size={24} />
           </div>
           <h3 className="font-bold text-gray-800 mb-1">Гибкие тарифы</h3>
           <p className="text-sm text-gray-500">Стоимость автоматически рассчитывается на основе веса посылки и зоны дальности.</p>
        </div>
      </div>
    </div>
  );
}
