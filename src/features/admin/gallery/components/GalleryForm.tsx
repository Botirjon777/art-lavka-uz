"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUpload, FiSave } from "react-icons/fi";
import { getProducts } from "@/features/admin/products/actions/products"; // Note: will move products actions soon
import { createGallery, updateGallery } from "../actions/gallery";
import { uploadFileAction } from "../../shared/actions/upload";
import { GalleryImage } from "../types";

import { Button, Input } from "@/components/ui";

interface Product {
  _id: string;
  name: string;
}

interface GalleryFormProps {
  initialData?: GalleryImage;
  isEditing?: boolean;
}

export default function GalleryForm({ initialData, isEditing = false }: GalleryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [name, setName] = useState(initialData?.name || "");
  const [selectedProductId, setSelectedProductId] = useState(initialData?.productId || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
    if (initialData) {
      setName(initialData.name);
      setImageUrl(initialData.image);
      setSelectedProductId(initialData.productId || "");
    }
  }, [initialData]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "art-lavka/gallery");

    try {
      const data = await uploadFileAction(formData);
      if (data.success && data.url) {
        setImageUrl(data.url);
        toast.success("Изображение загружено");
      } else {
        toast.error(data.error || "Ошибка при загрузке");
      }
    } catch (error) {
      toast.error("Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const nameValue = (formData.get("name") as string) || "";
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!nameValue.trim()) newErrors.name = "Пожалуйста, введите название или описание";
    if (!imageUrl) newErrors.image = "Пожалуйста, загрузите изображение";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Пожалуйста, заполните обязательные поля");
      return;
    }

    setErrors({});
    setLoading(true);
    formData.set("image", imageUrl);

    try {
      const result = isEditing && initialData
        ? await updateGallery(initialData._id, formData)
        : await createGallery(formData);

      if (result.success) {
        toast.success(isEditing ? "Изменения сохранены" : "Успешно добавлено");
        router.push("/admin/gallery");
      } else {
        toast.error(result.error || "Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
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
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? "Редактировать фото" : "Добавить фото в галерею"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-8 border border-gray-100"
      >
        {/* Image Upload */}
        <div className={`p-6 rounded-[20px] border-2 transition-colors ${errors.image ? 'border-red-500 bg-red-50/10' : 'border-transparent'}`}>
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
                разрешения. PNG, JPG или WebP.
              </p>
                {uploading && (
                  <p className="text-sm text-purple-600 animate-pulse">
                    Загрузка...
                  </p>
                )}
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
              </div>
            </div>
          </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Name */}
          <Input
            label="Название / Описание"
            name="name"
            required
            defaultValue={name}
            placeholder="Напр: Футболка оверсайз белая"
            error={errors.name}
          />

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
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            {loading ? "Сохранение..." : isEditing ? "Сохранить изменения" : "Сохранить фото"}
          </button>
        </div>
      </form>
    </div>
  );
}
