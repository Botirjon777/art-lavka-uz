"use client";

import { useState } from "react";
import { createProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { ProductInventory } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [inventory, setInventory] = useState<ProductInventory>({
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  });

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
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl);
    formData.set("inventory", JSON.stringify(inventory));

    const result = await createProduct(formData);

    if (result.success) {
      toast.success("Продукт успешно создан");
      router.push("/admin/products");
    } else {
      toast.error(result.error || "Не удалось создать продукт");
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Добавить продукт
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-6"
      >
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение продукта *
          </label>
          <div className="flex items-start gap-4">
            {imageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8814B1] file:text-white hover:file:bg-[#8814B1]/90"
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
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Название товара *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="Футболка овер сайз"
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Цена (сум) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="100000"
          />
        </div>

        {/* Inventory by Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Склад по размерам
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
              <div key={size}>
                <label
                  htmlFor={`inventory-${size}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Всего на складе:{" "}
            <span className="font-semibold">
              {Object.values(inventory).reduce((sum, count) => {
                const num = Number(count);
                return sum + (isNaN(num) ? 0 : num);
              }, 0)}
            </span>
          </p>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Категория *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
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
            defaultChecked
            className="w-4 h-4 text-[#8814B1] border-gray-300 rounded focus:ring-[#8814B1]"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Активен (видим для клиентов)
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="flex-1 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Создание..." : "Создать продукт"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
