"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiSave, FiArrowLeft, FiImage, FiTrendingUp } from "react-icons/fi";
import { Publication } from "@/types";
import { createPublication, updatePublication } from "../actions/publications";
import { uploadFileAction } from "@/features/admin/shared/actions/upload";
import { Button, Input, Textarea, Dropdown } from "@/components/ui";
import Image from "next/image";
import MediaPickerModal from "@/features/admin/shared/components/MediaPickerModal";

interface PublicationFormProps {
  initialData?: Publication;
  isEditing?: boolean;
}

export default function PublicationForm({
  initialData,
  isEditing = false,
}: PublicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [targetUrl, setTargetUrl] = useState(initialData?.targetUrl || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [type, setType] = useState(initialData?.type || "promo");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Заголовок обязателен";
    if (!targetUrl.trim()) newErrors.targetUrl = "Целевая ссылка обязательна";
    
    // Check if targetUrl is valid (at least starts with http or /)
    if (targetUrl && !targetUrl.startsWith("http") && !targetUrl.startsWith("/")) {
      newErrors.targetUrl = "Ссылка должна начинаться с http://, https:// или /";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadFileAction(formData);
      if (result.success && result.url) {
        setImageUrl(result.url);
        toast.success("Изображение загружено");
      } else {
        toast.error(result.error || "Ошибка при загрузке");
      }
    } catch (error) {
      toast.error("Ошибка при выполнении операции");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("targetUrl", targetUrl);
    formData.append("image", imageUrl);
    formData.append("type", type);
    formData.append("isActive", isActive.toString());

    try {
      const result = isEditing && initialData?._id
        ? await updatePublication(initialData._id, formData)
        : await createPublication(formData);

      if (result.success) {
        toast.success(isEditing ? "Публикация обновлена" : "Публикация создана");
        router.push("/admin/publications");
      } else {
        toast.error(result.error || "Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Ошибка при выполнении операции");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all shadow-sm border border-gray-100"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? "Редактировать публикацию" : "Новая публикация"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing ? "Измените параметры и статистику публикации" : "Создайте контент и настройте отслеживание"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 space-y-6">
            <Input
              label="Заголовок публикации"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите броский заголовок"
              error={errors.title}
              required
            />

            <Textarea
              label="Описание / Контент"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Расскажите об акции или новости подробнее..."
              rows={6}
            />

            <div className="space-y-2">
               <Input
                label="Целевая ссылка (Target URL)"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://art-lavka.uz/products/..."
                error={errors.targetUrl}
                required
              />
              <p className="text-[11px] text-gray-400 pl-1">
                Пользователи будут перенаправлены на этот адрес после клика по ссылке отслеживания.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 flex justify-between items-center">
             <div>
               <h4 className="font-bold text-gray-800">Статус публикации</h4>
               <p className="text-sm text-gray-500">Только активные публикации доступны для отслеживания и рассылок</p>
             </div>
             <div 
               onClick={() => setIsActive(!isActive)}
               className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                 isActive ? "bg-green-500" : "bg-gray-300"
               }`}
             >
               <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                 isActive ? "translate-x-6" : "translate-x-0"
               }`} />
             </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between gap-2 mb-2">
               <div className="flex items-center gap-2">
                 <FiImage className="text-[#8814B1]" />
                 <h4 className="font-bold text-gray-800">Обложка</h4>
               </div>
               <button
                 type="button"
                 onClick={() => setIsMediaPickerOpen(true)}
                 className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg transition-all"
               >
                 <FiTrendingUp className="w-3 h-3" />
                 ИЗ ИСТОРИИ
               </button>
            </div>
            
            <div className="relative aspect-square bg-gray-50 rounded-[20px] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group">
              {imageUrl ? (
                <>
                  <Image src={imageUrl} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer px-3 py-2 bg-white text-[#8814B1] rounded-lg font-medium text-xs">
                      {uploading ? "..." : "Новое"}
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3 py-2 bg-[#8814B1] text-white rounded-lg font-medium text-xs shadow-sm hover:bg-[#8814B1]/90 transition-all"
                    >
                      История
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-[#8814B1] transition-colors">
                    <FiImage className="w-10 h-10" />
                    <span className="text-sm font-medium">{uploading ? "Загрузка..." : "Загрузить фото"}</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  <p className="text-xs text-gray-300">или</p>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="text-xs font-bold text-[#8814B1] bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 hover:bg-purple-100 transition-all shadow-sm"
                  >
                    Выбрать из истории
                  </button>
                </div>
              )}
            </div>
          </div>

          <MediaPickerModal
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={(url) => setImageUrl(url)}
          />

          {/* Type Selection */}
          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100">
             <Dropdown
              label="Тип публикации"
              value={type}
              onChange={(v) => setType(v as "news" | "promo" | "social")}
              options={[
                { value: "promo", label: "Промо / Акция" },
                { value: "news", label: "Новости" },
                { value: "social", label: "Соц. сети" },
              ]}
            />
          </div>

          {/* Stats Summary (if editing) */}
          {isEditing && (
            <div className="bg-[#8814B1] rounded-[30px] p-8 text-white shadow-lg space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <FiTrendingUp className="text-purple-200" />
                 <h4 className="font-bold">Текущая статистика</h4>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-purple-200 mb-1">Просмотры</p>
                    <p className="text-2xl font-bold">{initialData?.views.toLocaleString()}</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-purple-200 mb-1">Клики</p>
                    <p className="text-2xl font-bold">{initialData?.clicks.toLocaleString()}</p>
                 </div>
               </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#8814B1] hover:bg-[#8814B1]/90 shadow-lg py-6"
            disabled={loading}
          >
            <FiSave className="w-5 h-5 mr-3" />
            {loading ? "Сохранение..." : isEditing ? "Обновить публикацию" : "Создать публикацию"}
          </Button>
        </div>
      </form>
    </div>
  );
}
