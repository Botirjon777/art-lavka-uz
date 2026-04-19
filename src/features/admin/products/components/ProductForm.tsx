"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { Product } from "../types";
import { createProduct, updateProduct, broadcastProductPromo } from "../actions/products";
import { uploadFileAction } from "../../shared/actions/upload";
import ColorPicker, { Color } from "./ColorPicker";
import SizeTableEditor from "./SizeTableEditor";
import { SizeTableEntry } from "../types";
import { ProductInventory } from "@/types";
import { Button, Input, Textarea, Dropdown } from "@/components/ui";
import type { Lang } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";

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
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State (non-translatable)
  const [model, setModel] = useState(initialData?.model || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [colors, setColors] = useState<Color[]>(initialData?.colors || []);
  const [category, setCategory] = useState(initialData?.category || "men");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [sizeTable, setSizeTable] = useState<SizeTableEntry[]>(
    initialData?.sizeTable || [],
  );
  const [lastPromoSentAt, setLastPromoSentAt] = useState<string | undefined>(
    initialData?.lastPromoSentAt
  );
  const [weight, setWeight] = useState(initialData?.weight || 0.5);

  // Multilingual content (name + description) per language
  type LangContent = { name: string; description: string };
  const [langContent, setLangContent] = useState<Record<Lang, LangContent>>({
    ru: { name: initialData?.name || "", description: initialData?.description || "" },
    en: {
      name: (initialData as any)?.translations?.en?.name || "",
      description: (initialData as any)?.translations?.en?.description || "",
    },
    uz: {
      name: (initialData as any)?.translations?.uz?.name || "",
      description: (initialData as any)?.translations?.uz?.description || "",
    },
  });
  const [activeLangTab, setActiveLangTab] = useState<Lang>("ru");

  // Convenience shortcuts for the current language tab
  const name = langContent[activeLangTab].name;
  const description = langContent[activeLangTab].description;

  const setName = (v: string) =>
    setLangContent((prev) => ({ ...prev, [activeLangTab]: { ...prev[activeLangTab], name: v } }));
  const setDescription = (v: string) =>
    setLangContent((prev) => ({ ...prev, [activeLangTab]: { ...prev[activeLangTab], description: v } }));

  useEffect(() => {
     if (initialData) {
      setLangContent({
        ru: { name: initialData.name || "", description: initialData.description || "" },
        en: {
          name: (initialData as any)?.translations?.en?.name || "",
          description: (initialData as any)?.translations?.en?.description || "",
        },
        uz: {
          name: (initialData as any)?.translations?.uz?.name || "",
          description: (initialData as any)?.translations?.uz?.description || "",
        },
      });
      setModel(initialData.model || "");
      setImageUrl(initialData.image || "");
      setColors(initialData.colors || []);
      setCategory(initialData.category || "men");
      setActive(initialData.active ?? true);
      setSizeTable(initialData.sizeTable || []);
      setLastPromoSentAt(initialData.lastPromoSentAt);
      setWeight(initialData.weight || 0.5);
    }
  }, [initialData]);

  const isDirty = 
    langContent.ru.name !== (initialData?.name || "") ||
    langContent.ru.description !== (initialData?.description || "") ||
    langContent.en.name !== ((initialData as any)?.translations?.en?.name || "") ||
    langContent.en.description !== ((initialData as any)?.translations?.en?.description || "") ||
    langContent.uz.name !== ((initialData as any)?.translations?.uz?.name || "") ||
    langContent.uz.description !== ((initialData as any)?.translations?.uz?.description || "") ||
    model !== (initialData?.model || "") ||
    category !== (initialData?.category || "men") ||
    imageUrl !== (initialData?.image || "") ||
    active !== (initialData?.active ?? true) ||
    weight !== (initialData?.weight || 0.5) ||
    JSON.stringify(sizeTable) !== JSON.stringify(initialData?.sizeTable || []) ||
    JSON.stringify(colors) !== JSON.stringify(initialData?.colors || []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "art-lavka/products");

    try {
      const data = await uploadFileAction(formData);

      if (data.success && data.url) {
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
    const formData = new FormData(e.currentTarget);

    // Validation
    const newErrors: Record<string, string> = {};
    if (!langContent.ru.name.trim()) newErrors.name = "Пожалуйста, введите название товара (RU)";
    if (!category) newErrors.category = "Пожалуйста, выберите категорию";
    if (!imageUrl) newErrors.image = "Пожалуйста, загрузите основное изображение";

    if (colors.length === 0) {
      newErrors.colors = "Добавьте хотя бы один цвет";
    } else {
      const hasVariants = colors.some(
        (c) => c.variants && c.variants.length > 0,
      );
      if (!hasVariants) {
        newErrors.colors = "Добавьте варианты (размер/цена) для выбранных цветов";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Пожалуйста, заполните обязательные поля");
      return;
    }

    setErrors({});
    setLoading(true);
    // Base fields use RU content
    formData.set("name", langContent.ru.name);
    formData.set("description", langContent.ru.description);
    formData.set("image", imageUrl);
    formData.set("colors", JSON.stringify(colors));
    formData.set("sizeTable", JSON.stringify(sizeTable));
    formData.set("model", model);
    formData.set("active", active.toString());
    formData.set("weight", weight.toString());
    // Translations
    formData.set("translations", JSON.stringify({
      ru: langContent.ru,
      en: langContent.en,
      uz: langContent.uz,
    }));

    try {
      const result =
        isEditing && initialData
          ? await updateProduct(initialData._id, formData)
          : await createProduct(formData);

      if (result.success) {
        toast.success(
          isEditing ? "Изменения сохранены" : "Продукт успешно создан",
        );
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        
        // If we were creating, move to edit page of the new product
        if (!isEditing && result.product?._id) {
          router.replace(`/admin/products/${result.product._id}/edit`);
        }
      } else {
        toast.error(result.error || "Не удалось сохранить продукт");
      }
    } catch (error: any) {
      toast.error(error.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastPromo = async () => {
    if (!initialData?._id) return;
    
    setIsBroadcasting(true);
    try {
      const result = await broadcastProductPromo(initialData._id);
      if (result.success) {
        toast.success("Рассылка успешно отправлена!");
        setLastPromoSentAt(result.lastPromoSentAt?.toString());
      } else {
        toast.error(result.error || "Не удалось отправить рассылку");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка при отправке рассылки");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const canBroadcast = () => {
    if (!isEditing || !initialData?._id) return false;
    if (!lastPromoSentAt) return true;

    const now = new Date();
    const lastSent = new Date(lastPromoSentAt);
    const diffMs = now.getTime() - lastSent.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours >= 24;
  };

  const getRemainingPromoTime = () => {
    if (!lastPromoSentAt) return "";
    const lastSent = new Date(lastPromoSentAt);
    const nextAvailable = new Date(lastSent.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = nextAvailable.getTime() - now.getTime();
    
    if (diffMs <= 0) return "";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
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
          noValidate
          className="bg-white p-5 shadow-sm space-y-5 border rounded-lg border-gray-100"
        >
          {/* Image Upload */}
          <div
            className={`rounded-xl border transition-colors ${errors.image ? "border-red-500 bg-red-50/10" : "border-transparent"}`}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-5">
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
                {errors.image && (
                  <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Multilingual Name + Description */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Language Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              {LANGUAGES.map((l) => {
                const hasContent = langContent[l.id].name.trim().length > 0;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLangTab(l.id)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold transition-all border-b-2 ${
                      activeLangTab === l.id
                        ? "border-[#8814B1] text-[#8814B1] bg-white"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {hasContent && l.id !== "ru" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                    {l.id === "ru" && !langContent.ru.name.trim() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>🌐</span>
                <span>
                  {activeLangTab === "ru"
                    ? "Основной язык (обязательно)"
                    : `Перевод для ${LANGUAGES.find(l => l.id === activeLangTab)?.label} (необязательно)`}
                </span>
              </div>

              <Input
                label={`Название товара ${activeLangTab.toUpperCase()}`}
                id={`name-${activeLangTab}`}
                name="name"
                required={activeLangTab === "ru"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={activeLangTab === "ru" ? "Футболка овер сайз" : activeLangTab === "en" ? "Oversized T-Shirt" : "Oversize futbolka"}
                error={activeLangTab === "ru" ? errors?.name : undefined}
              />

              <Textarea
                label={`Описание ${activeLangTab.toUpperCase()}`}
                id={`description-${activeLangTab}`}
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={activeLangTab === "ru" ? "Описание продукта..." : activeLangTab === "en" ? "Product description..." : "Mahsulot tavsifi..."}
              />
            </div>
          </div>
          <Input
            label="Путь к 3D модели (.glb)"
            id="model"
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="/model/compressed/base.glb"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                error={errors.category}
              />
              <input type="hidden" name="category" value={category} />
            </div>

            <Input
              label="Вес товара (кг)"
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Size Table Configuration */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl text-gray-800 mb-6">Таблица размеров</h3>
            <SizeTableEditor data={sizeTable} onChange={setSizeTable} />
          </div>

          {/* Colors and Variants */}
          <div>
            <label className="block text-xl text-gray-800 mb-4">
              Цвета, Размеры и Цены
            </label>
            <ColorPicker
              colors={colors}
              onChange={setColors}
              error={errors.colors}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 text-[#8814B1] border-gray-300 rounded-lg focus:ring-[#8814B1] cursor-pointer"
            />
            <label
              htmlFor="active"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Активен (видим для клиентов)
            </label>
          </div>

          {/* Broadcast Promo */}
          {isEditing && (
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-[16px] font-bold text-[#8814B1] flex items-center gap-2">
                  🚀 Рассылка акции
                </h4>
                <p className="text-xs text-purple-600">
                  {lastPromoSentAt 
                    ? `Последняя рассылка: ${new Date(lastPromoSentAt).toLocaleString("ru-RU")}`
                    : "Рассылка еще не отправлялась для этого товара"}
                </p>
                {!canBroadcast() && (
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Будет доступно через: {getRemainingPromoTime()}
                  </p>
                )}
              </div>
              
              <Button
                type="button"
                onClick={handleBroadcastPromo}
                disabled={!canBroadcast() || isBroadcasting}
                variant="primary"
                className="bg-[#8814B1] hover:bg-[#8814B1]/90"
              >
                {isBroadcasting ? "Отправка..." : "Разослать акцию"}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" size="md" disabled={loading || !isDirty}>
              <FiSave className="w-5 h-5" />
              {loading
                ? "Сохранение..."
                : isEditing
                  ? "Сохранить изменения"
                  : "Создать продукт"}
            </Button>
            
            {isEditing && initialData?.updatedAt && (
              <div className="text-sm text-gray-500">
                <p>Изменено: {new Date(initialData.updatedAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
