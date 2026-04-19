"use client";

import { Promotion } from "@/types";
import { getPromotions, deletePromotion, togglePromotionStatus } from "../actions/promotions";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash2, FiTag, FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Loader from "@/components/Loader";

export default function PromotionList() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    const result = await getPromotions();
    if (result.success) {
      setPromotions(result.data);
    } else {
      toast.error(result.error || "Ошибка при загрузке акций");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту акцию?")) return;
    const result = await deletePromotion(id);
    if (result.success) {
      toast.success("Акция удалена");
      fetchPromotions();
    } else {
      toast.error(result.error || "Ошибка при удалении");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await togglePromotionStatus(id, !currentStatus);
    if (result.success) {
      toast.success(`Акция ${!currentStatus ? "активирована" : "деактивирована"}`);
      fetchPromotions();
    } else {
      toast.error(result.error || "Ошибка при изменении статуса");
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Промоакции</h1>
          <p className="text-gray-500 mt-1">Управление скидками и специальными предложениями</p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiPlus className="w-5 h-5" />
          Новая акция
        </Link>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiTag className="w-10 h-10 text-[#8814B1]" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Акций пока нет</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Создайте свою первую акцию для привлечения клиентов</p>
          <Link
            href="/admin/promotions/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-2xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Создать акцию
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {promotions.map((promo) => {
            const expired = isExpired(promo.endDate);
            return (
              <div key={promo._id} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-50 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Status Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    promo.isActive && !expired ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                  }`}>
                    <FiTag size={32} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{promo.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        promo.isActive && !expired ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {expired ? "Завершена" : promo.isActive ? "Активна" : "Черновик"}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-[#8814B1] rounded-full text-[10px] font-black uppercase tracking-widest">
                        {promo.type === 'global' ? 'Глобальная' : 'Целевая'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                      <p className="flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400" />
                        {new Date(promo.startDate).toLocaleDateString()} — {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                      <p className="px-3 py-0.5 bg-gray-100 rounded-lg text-gray-700 font-bold">
                        {promo.discountType === 'free_delivery' 
                          ? 'Бесплатная доставка' 
                          : `${promo.discountValue}${promo.discountType === 'percentage' ? '%' : ' UZS'}`}
                      </p>
                    </div>
                  </div>

                  {/* Stats/Badge */}
                  <div className="hidden lg:block px-6 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Тип правила</p>
                    <p className="text-sm font-bold text-gray-700">
                      {promo.conditionType === 'min_items' ? `От ${promo.conditionValue} товаров` :
                       promo.conditionType === 'min_amount' ? `От ${parseInt(promo.conditionValue).toLocaleString()} UZS` :
                       'На выбранные товары'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <button
                      onClick={() => handleToggleStatus(promo._id, promo.isActive)}
                      className={`p-3 rounded-xl transition-all shadow-sm border ${
                        promo.isActive 
                        ? "text-amber-600 hover:bg-amber-50 border-amber-100" 
                        : "text-green-600 hover:bg-green-50 border-green-100"
                      }`}
                      title={promo.isActive ? "Деактивировать" : "Активировать"}
                    >
                      {promo.isActive ? <FiXCircle size={20} /> : <FiCheckCircle size={20} />}
                    </button>
                    <Link
                      href={`/admin/promotions/${promo._id}/edit`}
                      className="p-3 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all shadow-sm"
                      title="Редактировать"
                    >
                      <FiEdit size={20} />
                    </Link>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="p-3 text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all shadow-sm"
                      title="Удалить"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
