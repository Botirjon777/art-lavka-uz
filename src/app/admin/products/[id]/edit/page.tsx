"use client";

import { useState, useEffect, use } from "react";
import { getProductById, updateProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    const data = await getProductById(id);
    if (data) {
      setProduct(data);
      setImageUrl(data.image || "");
      setModelUrl(data.model || "");
      setColors(data.colors || []);
      setSizes(data.sizes || []);
    } else {
      toast.error("Товар не найден");
      router.push("/admin/products");
    }
    setProductLoading(false);
  };

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

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl);
    formData.set("model", modelUrl);
    formData.set("colors", JSON.stringify(colors));
    formData.set("sizes", JSON.stringify(sizes));

    const result = await updateProduct(id, formData);

    if (result.success) {
      toast.success("Продукт успешно обновлен");
      router.push("/admin/products");
    } else {
      toast.error(result.error || "Не удалось обновить продукт");
    }

    setLoading(false);
  };

  if (productLoading) {
    return (
      <div className="max-w-3xl">
        <p className="text-gray-600">Загрузка товара...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Редактировать продукт
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-6"
      >
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение товара *
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
            defaultValue={product.name}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="Футболка овер сайз"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description || ""}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="Описание товара..."
          />
        </div>

        {/* Model Path */}
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Путь к 3D модели *
          </label>
          <input
            type="text"
            id="model"
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="/model/compressed/base.glb"
          />
          <p className="text-xs text-gray-500 mt-1">
            Путь к файлу 3D модели (.glb)
          </p>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Доступные цвета *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addColor())
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
              placeholder="Введите цвет (напр: белый, черный)"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 bg-[#8814B1] text-white rounded-xl hover:bg-[#8814B1]/90"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <span
                key={color}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Доступные размеры *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSize())
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
              placeholder="Введите размер (напр: XS, S, M, L, XL)"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 bg-[#8814B1] text-white rounded-xl hover:bg-[#8814B1]/90"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
              >
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
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
              defaultValue={product.price}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
              placeholder="100000"
            />
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Склад
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              defaultValue={product.stock}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
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
            defaultValue={product.category}
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
            defaultChecked={product.active}
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
            disabled={
              loading ||
              !imageUrl ||
              !modelUrl ||
              colors.length === 0 ||
              sizes.length === 0
            }
            className="flex-1 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Обновление..." : "Обновить продукт"}
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
