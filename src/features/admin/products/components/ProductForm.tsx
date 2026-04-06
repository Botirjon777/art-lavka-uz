"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { Product } from "../types";
import { createProduct, updateProduct } from "../actions/products";
import ColorPicker, { Color } from "./ColorPicker";
import { ProductInventory } from "@/types";

interface ProductFormProps {
  initialData?: Product & {
    model?: string;
    colors?: Color[];
    inventory?: ProductInventory;
  };
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [colors, setColors] = useState<Color[]>(initialData?.colors || []);

  useEffect(() => {
    if (initialData) {
      setImageUrl(initialData.image);
      setColors(initialData.colors || []);
    }
  }, [initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.url);
        toast.success("Изображение успешно загружено");
      } else {
        toast.error(data.error || "Не удалось загрузить изображение");
      }
    } catch (error) {
      toast.error("Не удалось загрузить изображение");
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
    formData.set("colors", JSON.stringify(colors));

    // Calculate base price if needed (e.g. min price across all variants)
    let minPrice = Infinity;
    colors.forEach((c) => {
      c.variants?.forEach((v) => {
        if (v.price < minPrice) minPrice = v.price;
      });
    });
    if (minPrice !== Infinity) {
      formData.set("price", minPrice.toString());
    }

    try {
      const result =
        isEditing && initialData
          ? await updateProduct(initialData._id, formData)
          : await createProduct(formData);

      if (result.success) {
        toast.success(
          isEditing ? "Изменения сохранены" : "Продукт успешно создан",
        );
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Не удалось сохранить продукт");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8814B1] mb-2 transition-colors"
          >
            <FiArrowLeft /> Назад
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? "Редактировать продукт" : "Добавить продукт"}
          </h1>
        </div>
      </div>

      <div className="mx-auto transition-all duration-300">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-sm p-5 shadow-sm space-y-5 border border-gray-100"
        >
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Изображение продукта *
            </label>
            <div className="flex items-start gap-4">
              {imageUrl && (
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-[#8814B1] hover:file:bg-purple-100 transition-all cursor-pointer"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP до 5МБ
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Название товара *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialData?.name}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              placeholder="Футболка овер сайз"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={initialData?.description}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
              placeholder="Описание продукта..."
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Категория *
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={initialData?.category || "men"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none bg-white transition-all"
            >
              <option value="women">Женское</option>
              <option value="men">Мужское</option>
              <option value="kids">Детское</option>
            </select>
          </div>

          {/* Colors and Variants */}
          <div>
            <label className="block text-xl font-bold text-gray-800 mb-4">
              Цвета, Размеры и Цены
            </label>
            <ColorPicker colors={colors} onChange={setColors} />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              value="true"
              defaultChecked={initialData ? initialData.active : true}
              className="w-5 h-5 text-[#8814B1] border-gray-300 rounded-lg focus:ring-[#8814B1] cursor-pointer"
            />
            <label
              htmlFor="active"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Активен (видим для клиентов)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="p-2.5 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-md transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            <FiSave className="w-5 h-5" />
            {loading
              ? "Сохранение..."
              : isEditing
                ? "Сохранить изменения"
                : "Создать продукт"}
          </button>
        </form>
      </div>
    </div>
  );
}
