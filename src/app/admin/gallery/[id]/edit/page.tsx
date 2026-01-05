"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGalleryById, updateGallery } from "@/app/actions/gallery";
import { getProducts } from "@/app/actions/products";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUpload, FiSave } from "react-icons/fi";

interface Product {
  _id: string;
  name: string;
}

export default function EditGalleryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setFetching(true);
    const [pData, gData] = await Promise.all([
      getProducts(),
      getGalleryById(id as string),
    ]);

    setProducts(pData);

    if (gData) {
      setName(gData.name);
      setImageUrl(gData.image);
      setSelectedProductId(gData.productId || "");
    } else {
      toast.error("Изображение не найдено");
      router.push("/admin/gallery");
    }
    setFetching(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
        toast.success("Изображение загружено");
      } else {
        toast.error("Ошибка при загрузке");
      }
    } catch (error) {
      toast.error("Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Пожалуйста, загрузите изображение");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl);

    const result = await updateGallery(id as string, formData);
    if (result.success) {
      toast.success("Изменения сохранены");
      router.push("/admin/gallery");
    } else {
      toast.error(result.error || "Ошибка при сохранении");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8814B1] transition-colors mb-4"
        >
          <FiArrowLeft />
          Назад к галерее
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Редактировать фото</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-8 border border-gray-100"
      >
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Изображение *
          </label>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className={`relative w-64 h-64 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed transition-all ${
                imageUrl ? "border-purple-200" : "border-gray-200"
              }`}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <FiUpload className="w-10 h-10 mb-2" />
                  <span className="text-xs">Нет фото</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-[#8814B1] hover:file:bg-purple-100 transition-all cursor-pointer"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                Рекомендуется использовать квадратные изображения высокого
                разрешения.
              </p>
              {uploading && (
                <p className="text-sm text-purple-600 animate-pulse">
                  Загрузка...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Название / Описание *
            </label>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр: Футболка оверсайз белая"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
          </div>

          {/* Product Link */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Привязать к товару (необязательно)
            </label>
            <select
              name="productId"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white"
            >
              <option value="">Не привязывать</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link
            href="/admin/gallery"
            className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-medium"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex items-center gap-2 px-8 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
}
