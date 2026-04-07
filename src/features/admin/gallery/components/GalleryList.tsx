"use client";

import { useAdminGallery, useDeleteGallery } from "../hooks/useGallery";
import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { GalleryImage } from "../types";
import Loader from "@/components/Loader";

export default function GalleryList() {
  const { data: gallery = [], isLoading: loading } = useAdminGallery();
  const deleteMutation = useDeleteGallery();

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это изображение из галереи?"))
      return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Галерея</h1>
          <p className="text-gray-500 mt-1">
            Управление изображениями в фотогалерее на главной странице
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Добавить фото
        </Link>
      </div>

      {loading ? (
        <Loader />
      ) : gallery.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-4">Галерея пуста</p>
          <Link
            href="/admin/gallery/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Добавить первое фото
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {gallery.map((item: GalleryImage) => (
            <div
              key={item._id}
              className="bg-white rounded-[20px] p-4 shadow-sm hover:shadow-lg transition-all group border border-gray-100"
            >
              <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link
                    href={`/admin/gallery/${item._id}/edit`}
                    className="p-2.5 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    title="Изменить"
                  >
                    <FiEdit className="w-5 h-5 text-blue-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2.5 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                    title="Удалить"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="px-1">
                <p
                  className="font-medium text-gray-800 truncate"
                  title={item.name}
                >
                  {item.name}
                </p>
                {item.productId && (
                  <p className="text-xs text-purple-600 mt-1">
                    Привязан к товару
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
