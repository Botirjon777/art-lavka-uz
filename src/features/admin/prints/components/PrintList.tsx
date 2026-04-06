"use client";

import { useState, useEffect } from "react";
import { getPrints, deletePrint } from "../actions/prints";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from "react-icons/fi";

interface Print {
  _id: string;
  name: string;
  frontImage: string;
  backImage?: string;
  category: string;
  active: boolean;
}

export default function PrintList() {
  const [prints, setPrints] = useState<Print[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadPrints();
  }, []);

  const loadPrints = async () => {
    setLoading(true);
    try {
      const data = await getPrints();
      setPrints(data);
    } catch (error) {
      toast.error("Ошибка при загрузке принтов");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот принт?")) return;

    try {
      const result = await deletePrint(id);
      if (result.success) {
        toast.success("Принт успешно удален");
        loadPrints();
      } else {
        toast.error("Не удалось удалить принт");
      }
    } catch (error) {
      toast.error("Произошла ошибка при удалении");
    }
  };

  const filteredPrints =
    filter === "all" ? prints : prints.filter((p) => p.category === filter);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Принты</h1>
          <p className="text-gray-500 font-medium mt-1">Управление базой дизайнерских принтов</p>
        </div>
        <Link
          href="/admin/prints/new"
          className="flex items-center gap-2 px-8 py-4 bg-[#8814B1] hover:bg-[#701091] text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-100 group"
        >
          <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Добавить принт
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex bg-white p-2 rounded-[22px] border border-gray-100 shadow-sm gap-2 mb-8 overflow-x-auto no-scrollbar">
        {[
          { value: "all", label: "Все" },
          { value: "national", label: "Национальные" },
          { value: "stylish", label: "Стильные" },
          { value: "funny", label: "Прикольные" },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-6 py-2.5 rounded-[16px] font-bold text-sm transition-all whitespace-nowrap ${
              filter === cat.value
                ? "bg-[#8814B1] text-white shadow-lg shadow-purple-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mb-4"></div>
          <p className="text-gray-400 font-medium">Загрузка коллекции...</p>
        </div>
      ) : filteredPrints.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8814B1]">
             <FiLayers className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Принты не найдены</h3>
          <p className="text-gray-500 mb-8 px-10">В этой категории пока нет загруженных дизайнов. Самое время добавить что-то новое!</p>
          <Link
            href="/admin/prints/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all"
          >
            <FiPlus /> Создать первый принт
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPrints.map((print) => (
            <div
              key={print._id}
              className="bg-white rounded-[32px] p-5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group border border-gray-50 flex flex-col h-full"
            >
              <div className="relative aspect-square bg-gray-50 rounded-[24px] overflow-hidden mb-5 border border-gray-100">
                <Image
                  src={print.frontImage}
                  alt={print.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link
                    href={`/admin/prints/${print._id}/edit`}
                    className="p-3 bg-white text-gray-900 rounded-2xl hover:bg-[#8814B1] hover:text-white transition-all transform hover:scale-110"
                    title="Редактировать"
                  >
                    <FiEdit2 className="w-5 h-5 font-bold" />
                  </Link>
                  <button
                    onClick={() => handleDelete(print._id)}
                    className="p-3 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                    title="Удалить"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                   <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      print.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {print.active ? 'On' : 'Off'}
                   </span>
                </div>
              </div>

              <div className="px-1 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 leading-tight group-hover:text-[#8814B1] transition-colors line-clamp-2">
                    {print.name}
                  </h3>
                </div>
                
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8814B1] px-2 py-1 bg-purple-50 rounded-md">
                    {print.category}
                  </span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
