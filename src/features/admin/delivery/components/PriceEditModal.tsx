"use client";

import { useState, useEffect } from "react";
import { FiX, FiSave, FiAlertCircle } from "react-icons/fi";
import { updateDeliverySettings } from "../actions/deliveryPrices";
import toast from "react-hot-toast";

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryPrices: Record<string, number[]>;
  courierFees: { upto10kg: number; upto20kg: number };
  onSuccess: () => void;
}

export default function PriceEditModal({
  isOpen,
  onClose,
  deliveryPrices: initialPrices,
  courierFees: initialFees,
  onSuccess,
}: PriceEditModalProps) {
  const [prices, setPrices] = useState<Record<string, number[]>>(initialPrices);
  const [fees, setFees] = useState(initialFees);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPrices(initialPrices);
    setFees(initialFees);
  }, [initialPrices, initialFees]);

  if (!isOpen) return null;

  const handlePriceChange = (
    weight: string,
    zoneIdx: number,
    value: string,
  ) => {
    const newValue = parseInt(value.replace(/\D/g, "")) || 0;
    setPrices((prev) => {
      const newRow = [...prev[weight]];
      newRow[zoneIdx] = newValue;
      return { ...prev, [weight]: newRow };
    });
  };

  const handleFeeChange = (key: keyof typeof fees, value: string) => {
    const newValue = parseInt(value.replace(/\D/g, "")) || 0;
    setFees((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateDeliverySettings({
        deliveryPrices: prices,
        courierFees: fees,
      });
      if (result.success) {
        toast.success("Тарифы успешно обновлены");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Ошибка при обновлении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const weights = Object.keys(prices)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Редактирование тарифов
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Настройка стоимости BTS Express
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 transition-all shadow-sm"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Courier Fees */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FiAlertCircle size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Дополнительные сборы (Курьер)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  До 10 кг (UZS)
                </label>
                <input
                  type="text"
                  value={fees.upto10kg.toLocaleString()}
                  onChange={(e) => handleFeeChange("upto10kg", e.target.value)}
                  className="w-full bg-white border-2 border-transparent focus:border-purple-200 outline-none rounded-2xl px-5 py-3 font-bold text-gray-700 transition-all shadow-sm"
                />
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  11 - 20 кг (UZS)
                </label>
                <input
                  type="text"
                  value={fees.upto20kg.toLocaleString()}
                  onChange={(e) => handleFeeChange("upto20kg", e.target.value)}
                  className="w-full bg-white border-2 border-transparent focus:border-purple-200 outline-none rounded-2xl px-5 py-3 font-bold text-gray-700 transition-all shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Price Table */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FiSave size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Матрица цен (Вес / Зона)
              </h3>
            </div>

            <div className="overflow-x-auto rounded-[32px] border border-gray-100 shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="p-5 bg-gray-50/80 border-b border-gray-100 text-left text-[10px] uppercase font-black text-gray-400">
                      Вес
                    </th>
                    {[0, 1, 2, 3, 4, 5].map((zone) => (
                      <th
                        key={zone}
                        className="p-5 bg-gray-50/80 border-b border-gray-100 text-center text-[10px] uppercase font-black text-gray-400 whitespace-nowrap"
                      >
                        Зона {zone}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weights.map((weight) => (
                    <tr
                      key={weight}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-5 border-b border-gray-50 font-black text-gray-400 text-xs">
                        {weight} кг
                      </td>
                      {prices[weight.toString()].map((price, idx) => (
                        <td key={idx} className="p-3 border-b border-gray-50">
                          <input
                            type="text"
                            value={price.toLocaleString()}
                            onChange={(e) =>
                              handlePriceChange(
                                weight.toString(),
                                idx,
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent group-hover:bg-white border-2 border-transparent focus:border-purple-200 focus:bg-white outline-none rounded-xl px-3 py-2 text-center font-bold text-gray-600 text-sm transition-all"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 flex justify-end gap-4 bg-gray-50/30">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#8814B1] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            <FiSave size={16} />
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
