"use client";

import { useState } from "react";
import { createPrint } from "@/app/actions/prints";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NewPrintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");

  const handleFrontImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFront(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFrontImageUrl(data.url);
        toast.success("Переднее изображение загружено");
      } else {
        toast.error(data.error || "Не удалось загрузить переднее изображение");
      }
    } catch (error) {
      toast.error("Не удалось загрузить переднее изображение");
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBack(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBackImageUrl(data.url);
        toast.success("Заднее изображение загружено");
      } else {
        toast.error(data.error || "Не удалось загрузить заднее изображение");
      }
    } catch (error) {
      toast.error("Не удалось загрузить заднее изображение");
    } finally {
      setUploadingBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("frontImage", frontImageUrl);
    if (backImageUrl) {
      formData.set("backImage", backImageUrl);
    }

    const result = await createPrint(formData);

    if (result.success) {
      toast.success("Принт успешно создан");
      router.push("/admin/prints");
    } else {
      toast.error(result.error || "Не удалось создать принт");
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Добавить принт</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-6"
      >
        {/* Front Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Переднее изображение *
          </label>
          <div className="flex items-start gap-4">
            {frontImageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={frontImageUrl}
                  alt="Front Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFrontImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8814B1] file:text-white hover:file:bg-[#8814B1]/90"
                disabled={uploadingFront}
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP до 5МБ
              </p>
            </div>
          </div>
        </div>

        {/* Back Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заднее изображение (необязательно)
          </label>
          <div className="flex items-start gap-4">
            {backImageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={backImageUrl}
                  alt="Back Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8814B1] file:text-white hover:file:bg-[#8814B1]/90"
                disabled={uploadingBack}
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP до 5МБ (оставьте пустым для одностороннего
                принта)
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
            Название принта *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="Пузатый котик"
          />
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
            <option value="national">Национальные</option>
            <option value="stylish">Стильные</option>
            <option value="funny">Прикольные</option>
            <option value="all">Все</option>
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
            disabled={loading || !frontImageUrl}
            className="flex-1 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Создание..." : "Создать принт"}
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
