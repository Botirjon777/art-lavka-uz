"use client";

import { useState } from "react";
import { createPrint, updatePrint } from "../actions/prints";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { FiUploadCloud, FiX, FiCheckCircle, FiInfo, FiTrash2 } from "react-icons/fi";

interface PrintFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function PrintForm({ initialData, isEditing = false }: PrintFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState(initialData?.frontImage || "");
  const [backImageUrl, setBackImageUrl] = useState(initialData?.backImage || "");

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setField: (url: string) => void,
    setLoadingField: (loading: boolean) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingField(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
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
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("frontImage", frontImageUrl);
    if (backImageUrl) {
      formData.set("backImage", backImageUrl);
    }

    try {
      const result = isEditing 
        ? await updatePrint(initialData._id, formData)
        : await createPrint(formData);

      if (result.success) {
        toast.success(isEditing ? "Принт обновлен" : "Принт успешно создан");
        router.push("/admin/prints");
        router.refresh();
      } else {
        toast.error(result.error || "Ошибка при сохранении");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isEditing ? "Редактировать принт" : "Новый принт"}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {isEditing ? "Измените параметры существующего дизайна" : "Загрузите новый дизайн в коллекцию"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-purple-50 text-[#8814B1] rounded-xl"><FiInfo /></span>
              Основная информация
            </h3>
            
            <div className="space-y-8">
              <div className="group">
                <label htmlFor="name" className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1 group-focus-within:text-[#8814B1] transition-colors">
                  Название принта *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={initialData?.name}
                  className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[22px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-bold text-lg text-gray-900 placeholder:text-gray-300"
                  placeholder="Например: Узбекский узор"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
                  Категория *
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue={initialData?.category || "national"}
                    className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[22px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="national">Национальные</option>
                    <option value="stylish">Стильные</option>
                    <option value="funny">Прикольные</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visuals */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FiUploadCloud /></span>
              Визуализация дизайна
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Front Image */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Передняя сторона *</p>
                <div className={`relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer group ${
                  frontImageUrl ? 'border-gray-100' : 'border-gray-200 hover:border-[#8814B1] hover:bg-purple-50/30'
                }`}>
                  {frontImageUrl ? (
                    <>
                      <Image src={frontImageUrl} alt="Front" fill className="object-cover" />
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
                      <span className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg ${uploadingFront ? 'animate-pulse' : ''}`}>
                        <FiUploadCloud className={`w-8 h-8 ${uploadingFront ? 'text-[#8814B1]' : 'text-gray-300 group-hover:text-[#8814B1]'}`} />
                      </span>
                      <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600">Загрузить принт</p>
                      <p className="text-[10px] text-gray-300 font-bold uppercase mt-1 tracking-widest">Front View</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, setFrontImageUrl, setUploadingFront, "Переднее фото")}
                        className="hidden" 
                        disabled={uploadingFront} 
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Back Image */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Задняя сторона (опт.)</p>
                <div className={`relative aspect-square rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer group ${
                  backImageUrl ? 'border-gray-100' : 'border-gray-200 hover:border-[#8814B1] hover:bg-purple-50/30'
                }`}>
                  {backImageUrl ? (
                    <>
                      <Image src={backImageUrl} alt="Back" fill className="object-cover" />
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
                      <span className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg ${uploadingBack ? 'animate-pulse' : ''}`}>
                        <FiUploadCloud className={`w-8 h-8 ${uploadingBack ? 'text-[#8814B1]' : 'text-gray-300 group-hover:text-[#8814B1]'}`} />
                      </span>
                      <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600 text-center">Загрузить принт</p>
                      <p className="text-[10px] text-gray-300 font-bold uppercase mt-1 tracking-widest">Back View</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, setBackImageUrl, setUploadingBack, "Заднее фото")}
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

        <div className="space-y-8">
           {/* Settings Card */}
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Настройки публикации
             </h3>
             
             <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100 group cursor-pointer hover:bg-white hover:shadow-lg hover:shadow-purple-50 transition-all" 
                  onClick={() => {
                    const ck = document.getElementById('active') as HTMLInputElement;
                    if(ck) ck.checked = !ck.checked;
                  }}>
               <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 bg-[#8814B1] rounded-full animate-pulse" />
                 </div>
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
               <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">Видим ли дизайн в каталоге для выбора клиентами</p>
             </div>

             <div className="mt-8 space-y-4">
                <button
                  type="submit"
                  disabled={loading || !frontImageUrl}
                  className="w-full py-5 bg-[#8814B1] hover:bg-[#701091] text-white font-black text-lg rounded-[24px] transition-all shadow-xl shadow-purple-200 disabled:opacity-50 disabled:grayscale disabled:scale-95 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    isEditing ? "Синхронизировать" : "Запустить в тираж"
                  )}
                </button>
                <button
                   type="button"
                   onClick={() => router.back()}
                   className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-[22px] transition-all"
                >
                   Вернуться
                </button>
             </div>
           </div>

           {/* Tips Card */}
           <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-white/10 rounded-lg">
                    <FiInfo className="w-5 h-5 text-purple-400" />
                 </div>
                 <h4 className="font-bold">Pro Советы</h4>
              </div>
              <ul className="space-y-4 text-xs font-medium text-gray-400 leading-relaxed">
                 <li className="flex gap-3">
                    <span className="text-purple-400">01.</span>
                    Используйте PNG с прозрачным фоном для лучшего результата на 3D моделях
                 </li>
                 <li className="flex gap-3">
                    <span className="text-purple-400">02.</span>
                    Оптимизируйте размер файлов до 2МБ для быстрой прогрузки в клиенте
                 </li>
              </ul>
           </div>
        </div>
      </form>
    </div>
  );
}
