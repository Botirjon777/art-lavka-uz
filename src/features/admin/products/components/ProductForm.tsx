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
import { Button, Input, Textarea, Dropdown } from "@/components/ui";

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
  const [category, setCategory] = useState(initialData?.category || "men");

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
    formData.append("folder", "art-lavka/products");

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
      <div className="flex justify-between items-center mb-5">
        <Button
          onClick={() => router.back()}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 text-gray-500 hover:text-[#8814B1] transition-colors"
        >
          <FiArrowLeft /> Назад
        </Button>
      </div>

      <div className="mx-auto transition-all duration-300">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 shadow-sm space-y-5 border rounded-lg border-gray-100"
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
          <Input
            label="Название товара"
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            placeholder="Футболка овер сайз"
          />

          {/* Description */}
          <Textarea
            label="Описание"
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description}
            placeholder="Описание продукта..."
          />

          {/* Category */}
          <div className="relative">
            <Dropdown
              label="Категория"
              options={[
                { value: "women", label: "Женское" },
                { value: "men", label: "Мужское" },
                { value: "kids", label: "Детское" },
              ]}
              value={category}
              onChange={setCategory}
              required
            />
            <input type="hidden" name="category" value={category} />
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

          <Button type="submit" size="md" disabled={loading || !imageUrl}>
            <FiSave className="w-5 h-5" />
            {loading
              ? "Сохранение..."
              : isEditing
                ? "Сохранить изменения"
                : "Создать продукт"}
          </Button>
        </form>
      </div>
    </div>
  );
}
