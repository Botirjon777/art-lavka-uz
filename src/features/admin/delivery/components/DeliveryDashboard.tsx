"use client";

import { useState } from "react";
import ZoneTable from "./ZoneTable";
import PriceTable from "./PriceTable";
import OfficeManager from "./OfficeManager";
import { FiMap, FiDollarSign, FiClock, FiMapPin } from "react-icons/fi";

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState<"zones" | "prices" | "offices">("zones");

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Доставка</h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Тарифы и пункты выдачи BTS</p>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => setActiveTab("zones")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "zones" 
                ? "bg-white text-[#8814B1] shadow-sm shadow-purple-100 ring-1 ring-purple-100" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiMap size={14} />
            Зоны
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "prices" 
                ? "bg-white text-[#8814B1] shadow-sm shadow-purple-100 ring-1 ring-purple-100" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiDollarSign size={14} />
            Цены
          </button>
          <button
            onClick={() => setActiveTab("offices")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "offices" 
                ? "bg-white text-[#8814B1] shadow-sm shadow-purple-100 ring-1 ring-purple-100" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FiMapPin size={14} />
            Офисы
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === "zones" && <ZoneTable />}
        {activeTab === "prices" && <PriceTable />}
        {activeTab === "offices" && <OfficeManager />}
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
