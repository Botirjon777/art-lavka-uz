"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiSave, FiUpload, FiArrowLeft } from "react-icons/fi";
import { Product } from "../types";
import { createProduct, updateProduct } from "../actions/products";
import ColorPicker, { Color } from "./ColorPicker";
import { ProductInventory } from "@/types";
import TShirtScene from "@/features/client/home/components/shared/TShirtScene";

interface ProductFormProps {
  initialData?: Product & { model?: string; colors?: Color[]; inventory?: ProductInventory };
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [inventory, setInventory] = useState<ProductInventory>(
    initialData?.inventory || {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
    }
  );
  const [colors, setColors] = useState<Color[]>(initialData?.colors || []);
  const [modelPath, setModelPath] = useState(initialData?.model || "/model/compressed/base.glb");
  const [previewColor, setPreviewColor] = useState("#FFFFFF");
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (initialData) {
      setImageUrl(initialData.image);
      setInventory(initialData.inventory || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      setColors(initialData.colors || []);
      setModelPath(initialData.model || "/model/compressed/base.glb");
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
    formData.set("inventory", JSON.stringify(inventory));
    formData.set("colors", JSON.stringify(colors));

    try {
      const result = isEditing && initialData
        ? await updateProduct(initialData._id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast.success(isEditing ? "Изменения сохранены" : "Продукт успешно создан");
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
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              showPreview
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-[#8814B1]/10 text-[#8814B1] hover:bg-[#8814B1]/20"
            }`}
          >
            {showPreview ? "Скрыть просмотр" : "Показать просмотр"}
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${
          showPreview ? "lg:grid-cols-2" : "max-w-4xl mx-auto"
        } gap-8 items-start transition-all duration-300`}
      >
        {/* Left Side: Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[20px] p-8 shadow-sm space-y-6 border border-gray-100"
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

          {/* Model Path */}
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Путь к 3D модели *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              placeholder="/model/compressed/base.glb"
            />
            <p className="text-xs text-gray-500 mt-1">
              Путь к файлу 3D модели (например: /model/compressed/base.glb)
            </p>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Цена (сум) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              defaultValue={initialData?.price}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              placeholder="100000"
            />
          </div>

          {/* Inventory by Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Склад по размерам
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                <div key={size}>
                  <label
                    htmlFor={`inventory-${size}`}
                    className="block text-xs font-semibold text-gray-500 mb-1"
                  >
                    {size}
                  </label>
                  <input
                    type="number"
                    id={`inventory-${size}`}
                    min="0"
                    value={inventory[size]}
                    onChange={(e) =>
                      setInventory({
                        ...inventory,
                        [size]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Цвета товара
            </label>
            <ColorPicker
              colors={colors}
              onChange={setColors}
              previewColor={previewColor}
              onPreview={setPreviewColor}
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
            className="w-full py-4 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            <FiSave className="w-5 h-5" />
            {loading ? "Сохранение..." : isEditing ? "Сохранить изменения" : "Создать продукт"}
          </button>
        </form>

        {/* Right Side: Sticky Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-[20px] p-8 shadow-sm overflow-hidden border border-gray-100 min-h-[500px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-[#8814B1]/10 text-[#8814B1] rounded-lg text-sm">
                  3D
                </span>
                Предпросмотр товара
              </h3>
              <div className="flex-1 bg-gray-50 rounded-2xl relative group min-h-[400px]">
                <TShirtScene
                  selectedProduct={modelPath}
                  selectedColor={previewColor}
                  selectedPrint={null}
                  showUI={false}
                  modelScale={3.0}
                  modelPosition={[0, -2.2, 0]}
                  cameraPosition={[0, 0, 3]}
                />
                <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs text-gray-500 flex items-center gap-2">
                    <span>Зажмите, чтобы вращать</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                      Текущий цвет привью
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {previewColor.toUpperCase()}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: previewColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
