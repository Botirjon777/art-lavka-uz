"use client";

import { useState, useEffect, useCallback } from "react";
import { getDeliverySettings } from "../actions/deliveryPrices";
import PriceEditModal from "./PriceEditModal";
import { FiEdit2, FiRefreshCcw } from "react-icons/fi";

export default function PriceTable() {
  const [data, setData] = useState<{ 
    deliveryPrices: Record<string, number[]>, 
    courierFees: { upto10kg: number; upto20kg: number } 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getDeliverySettings();
    if (result.success) {
      setData({
        deliveryPrices: result.deliveryPrices,
        courierFees: result.courierFees
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-20 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
        <FiRefreshCcw className="animate-spin text-purple-600" size={32} />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Загрузка тарифов...</p>
      </div>
    );
  }

  if (!data) return null;

  const weights = Object.keys(data.deliveryPrices).map(Number).sort((a,b) => a-b);

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden relative group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Стоимость по весу и зонам</h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Тарифы (UZS) для почтовых отправлений BTS</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8814B1] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-105 active:scale-95 transition-all"
        >
          <FiEdit2 size={14} />
          Редактировать
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-50">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border-b border-gray-100 text-left text-[10px] uppercase font-black text-gray-400">
                Вес (кг)
              </th>
              {[0, 1, 2, 3, 4, 5].map((zone) => (
                <th key={zone} className="p-4 bg-gray-50 border-b border-gray-100 text-center text-[10px] uppercase font-black text-gray-400">
                  Зона {zone}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weights.map((weight) => (
              <tr key={weight} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 border-b border-gray-50 font-bold text-gray-400 text-xs">
                  {weight} кг
                </td>
                {data.deliveryPrices[weight.toString()].map((price, idx) => (
                  <td key={idx} className="p-4 border-b border-gray-50 text-center text-sm font-bold text-gray-600">
                    {price.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-10 p-8 bg-purple-50/50 rounded-[28px] border border-purple-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h4 className="text-sm font-black text-purple-900 uppercase tracking-widest mb-3">Дополнительные сборы (Курьер)</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Доставка в черте города (1-10 кг): <strong className="ml-1 text-purple-900 font-black">{data.courierFees.upto10kg.toLocaleString()} UZS</strong>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Доставка в черте города (11-20 кг): <strong className="ml-1 text-purple-900 font-black">{data.courierFees.upto20kg.toLocaleString()} UZS</strong>
            </div>
          </div>
        </div>
        <div className="text-purple-300 hidden lg:block">
           <FiRefreshCcw size={48} className="opacity-20" />
        </div>
      </div>

      <PriceEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deliveryPrices={data.deliveryPrices}
        courierFees={data.courierFees}
        onSuccess={fetchData}
      />
    </div>
  );
}
