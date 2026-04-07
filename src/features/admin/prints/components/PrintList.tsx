"use client";

import { useState } from "react";
import { useAdminPrints, useDeletePrint } from "../hooks/useAdminPrints";
import { useAdminPrintCategories } from "../hooks/useAdminCategories";
import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from "react-icons/fi";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Print, PrintCategory } from "@/types";
import Loader from "@/components/Loader";

export default function PrintList() {
  const { data: prints = [], isLoading: printsLoading } = useAdminPrints();
  const { data: categories = [], isLoading: catsLoading } = useAdminPrintCategories();
  const deleteMutation = useDeletePrint();
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  const loading = printsLoading || catsLoading;

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот принт?")) return;
    deleteMutation.mutate(id);
  };

  const filteredPrints =
    filter === "all" ? prints : prints.filter((p: Print) => p.category === filter);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Принты
          </h1>
          <p className="text-gray-500 font-medium mt-1 mb-5">
            Управление базой дизайнерских принтов
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/prints/new")}
          size="sm"
          className="bg-[#8814B1] text-white shadow-lg shadow-purple-100"
        >
          <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Добавить принт
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex p-2 rounded-[22px] gap-2 mb-8 overflow-x-auto no-scrollbar">
        <Button
          onClick={() => setFilter("all")}
          size="sm"
          className={` ${
            filter === "all"
              ? "bg-[#8814B1] text-white shadow-lg shadow-purple-100"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Все
        </Button>
        {categories.map((cat: PrintCategory) => (
          <Button
            key={cat.slug}
            onClick={() => setFilter(cat.slug)}
            size="sm"
            className={`${
              filter === cat.slug
                ? "bg-[#8814B1] text-white shadow-lg shadow-purple-100"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filteredPrints.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8814B1]">
            <FiLayers className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Принты не найдены
          </h3>
          <p className="text-gray-500 mb-8 px-10">
            В этой категории пока нет загруженных дизайнов. Самое время добавить
            что-то новое!
          </p>
          <Link
            href="/admin/prints/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all"
          >
            <FiPlus /> Создать первый принт
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPrints.map((print: Print) => (
            <div
              key={print._id}
              className="bg-white p-5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group rounded-xl flex flex-col h-full"
            >
              <div className="relative aspect-square bg-gray-50 rounded-[24px] overflow-hidden mb-5 border border-gray-100">
                <Image
                  src={print.frontImage}
                  alt={print.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
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
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      print.active
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {print.active ? "On" : "Off"}
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
                    {categories.find((c: PrintCategory) => c.slug === print.category)?.name ||
                      print.category}
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
