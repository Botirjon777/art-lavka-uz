"use client";

import { useState, useEffect } from "react";
import { useCreatePrint, useUpdatePrint } from "../hooks/useAdminPrints";
import { useAdminPrintCategories } from "../hooks/useAdminCategories";
import { uploadFileAction } from "../../shared/actions/upload";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FiUploadCloud,
  FiX,
  FiCheckCircle,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";
import { Button, Dropdown, Input } from "@/components/ui";
import { PrintCategory } from "@/types";

interface PrintFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function PrintForm({
  initialData,
  isEditing = false,
}: PrintFormProps) {
  const router = useRouter();
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState(
    initialData?.frontImage || "",
  );
  const [backImageUrl, setBackImageUrl] = useState(
    initialData?.backImage || "",
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useAdminPrintCategories();
  const createMutation = useCreatePrint();
  const updateMutation = useUpdatePrint();

  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isEditing && !category && categories.length > 0) {
      setCategory(categories[0].slug);
    }
  }, [categories, category, isEditing]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setField: (url: string) => void,
    setLoadingField: (loading: boolean) => void,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingField(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "art-lavka/prints");

    try {
      const data = await uploadFileAction(formData);

      if (data.success && data.url) {
        setField(data.url);
        toast.success(`${fieldName} успешно загружено`);
      } else {
        toast.error(data.error || "Ошибка при загрузке");
      }
    } catch (error) {
      toast.error("Ошибка сети при загрузке");
    } finally {
      setLoadingField(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string) || "";
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Пожалуйста, введите название принта";
    if (!category) newErrors.category = "Выберите категорию для принта";
    if (!frontImageUrl) newErrors.imageFront = "Загрузите переднюю сторону принта";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Пожалуйста, заполните обязательные поля");
      return;
    }

    setErrors({});
    formData.set("frontImage", frontImageUrl);
    if (backImageUrl) {
      formData.set("backImage", backImageUrl);
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: initialData._id, formData },
        {
          onSuccess: () => {
            router.push("/admin/prints");
            router.refresh();
          },
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          router.push("/admin/prints");
          router.refresh();
        },
      });
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between pb-5">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isEditing ? "Редактировать принт" : "Новый принт"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {isEditing
              ? "Измените параметры существующего дизайна"
              : "Загрузите новый дизайн в коллекцию"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="p-4 bg-white border cursor-pointer border-gray-100 rounded-2xl hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-purple-50 text-[#8814B1] rounded-xl">
                <FiInfo />
              </span>
              Основная информация
            </h3>

            <div className="space-y-8">
              <Input
                label="Название принта"
                id="name"
                name="name"
                required
                defaultValue={initialData?.name}
                placeholder="Например: Узбекский узор"
                error={errors.name}
              />

              <div>
                <Dropdown
                  label="Категория"
                  placeholder="Выберите категорию"
                  options={categories.map((cat: PrintCategory) => ({
                    value: cat.slug,
                    label: cat.name,
                  }))}
                  value={category}
                  onChange={setCategory}
                  required
                  error={errors.category}
                />
                <input type="hidden" name="category" value={category} />
              </div>
            </div>
          </div>

          {/* Visuals */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FiUploadCloud />
              </span>
              Визуализация дизайна
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Front Image */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Передняя сторона *
                </p>
                <div
                  className={`relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer group ${
                    errors.imageFront ? "border-red-500 bg-red-50/10" :
                    frontImageUrl
                      ? "border-gray-100"
                      : "border-gray-200 hover:border-[#8814B1] hover:bg-purple-50/30"
                  }`}
                >
                  {frontImageUrl ? (
                    <>
                      <Image
                        src={frontImageUrl}
                        alt="Front"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setFrontImageUrl("")}
                          className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-all font-bold text-xs flex items-center gap-2"
                        >
                          <FiTrash2 /> Очистить
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-pointer">
                      <span
                        className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg ${uploadingFront ? "animate-pulse" : ""}`}
                      >
                        <FiUploadCloud
                          className={`w-8 h-8 ${uploadingFront ? "text-[#8814B1]" : "text-gray-300 group-hover:text-[#8814B1]"}`}
                        />
                      </span>
                      <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600">
                        Загрузить принт
                      </p>
                      <p className="text-[10px] text-gray-300 font-bold uppercase mt-1 tracking-widest">
                        Front View
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            setFrontImageUrl,
                            setUploadingFront,
                            "Переднее фото",
                          )
                        }
                        className="hidden"
                        disabled={uploadingFront}
                      />
                    </label>
                  )}
                </div>
                {errors.imageFront && <p className="text-[11px] text-red-500 font-bold uppercase mt-2 ml-1">{errors.imageFront}</p>}
              </div>

              {/* Back Image */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Задняя сторона (опт.)
                </p>
                <div
                  className={`relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer group ${
                    backImageUrl
                      ? "border-gray-100"
                      : "border-gray-200 hover:border-[#8814B1] hover:bg-purple-50/30"
                  }`}
                >
                  {backImageUrl ? (
                    <>
                      <Image
                        src={backImageUrl}
                        alt="Back"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setBackImageUrl("")}
                          className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-all font-bold text-xs flex items-center gap-2"
                        >
                          <FiTrash2 /> Очистить
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-pointer">
                      <span
                        className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg ${uploadingBack ? "animate-pulse" : ""}`}
                      >
                        <FiUploadCloud
                          className={`w-8 h-8 ${uploadingBack ? "text-[#8814B1]" : "text-gray-300 group-hover:text-[#8814B1]"}`}
                        />
                      </span>
                      <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600 text-center">
                        Загрузить принт
                      </p>
                      <p className="text-[10px] text-gray-300 font-bold uppercase mt-1 tracking-widest">
                        Back View
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            setBackImageUrl,
                            setUploadingBack,
                            "Заднее фото",
                          )
                        }
                        className="hidden"
                        disabled={uploadingBack}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Settings Card */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiCheckCircle className="text-green-500" />
              Настройки публикации
            </h3>

            <div
              className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 group cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-purple-50 transition-all"
              onClick={() => {
                const ck = document.getElementById(
                  "active",
                ) as HTMLInputElement;
                if (ck) ck.checked = !ck.checked;
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  value="true"
                  defaultChecked={initialData ? initialData.active : true}
                  className="w-6 h-6 rounded-lg text-[#8814B1] border-gray-200 focus:ring-[#8814B1] cursor-pointer accent-[#8814B1]"
                />
              </div>
              <p className="font-bold text-gray-900">Активный статус</p>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">
                Видим ли дизайн в каталоге для выбора клиентами
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEditing ? (
                  "Синхронизировать"
                ) : (
                  "Запустить в тираж"
                )}
              </Button>
              <Button onClick={() => router.back()} variant="outline">
                Вернуться
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
