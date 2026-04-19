"use client";

import { Publication } from "@/types";
import { getPublications, deletePublication, broadcastPublicationToTelegram } from "../actions/publications";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash2, FiSend, FiCopy, FiExternalLink, FiBarChart2 } from "react-icons/fi";
import Loader from "@/components/Loader";

export default function PublicationList() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);

  const fetchPublications = async () => {
    setLoading(true);
    const result = await getPublications();
    if (result.success) {
      setPublications(result.data);
    } else {
      toast.error(result.error || "Ошибка при загрузке публикаций");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту публикацию?")) return;
    const result = await deletePublication(id);
    if (result.success) {
      toast.success("Публикация удалена");
      fetchPublications();
    } else {
      toast.error(result.error || "Ошибка при удалении");
    }
  };

  const handleBroadcast = async (id: string) => {
    if (!confirm("Отправить эту публикацию всем подписчикам в Telegram?")) return;
    
    setBroadcastingId(id);
    try {
      const result = await broadcastPublicationToTelegram(id);
      if (result.success) {
        toast.success("Рассылка успешно запущена!");
        fetchPublications();
      } else {
        toast.error(result.error || "Ошибка при рассылке");
      }
    } catch (error) {
      toast.error("Ошибка при выполнении операции");
    } finally {
      setBroadcastingId(null);
    }
  };

  const copyTrackingLink = (id: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/api/promo/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Ссылка для отслеживания скопирована!");
  };

  const calculateCTR = (views: number, clicks: number) => {
    if (views === 0) return "0%";
    return ((clicks / views) * 100).toFixed(1) + "%";
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Публикации</h1>
          <p className="text-gray-500 mt-1">Управление акциями и отслеживание переходов</p>
        </div>
        <Link
          href="/admin/publications/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Новая публикация
        </Link>
      </div>

      {publications.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBarChart2 className="w-8 h-8 text-[#8814B1]" />
          </div>
          <p className="text-gray-600 mb-6">У вас пока нет активных публикаций</p>
          <Link
            href="/admin/publications/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Создать первую публикацию
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {publications.map((pub) => (
            <div key={pub._id} className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Image or Icon Preview */}
                <div className="w-full md:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-50">
                  {pub.image ? (
                    <Image src={pub.image} alt={pub.title} fill sizes="(max-width: 768px) 100vw, 128px" className="object-cover" />
                  ) : (
                    <FiSend className="w-10 h-10 text-purple-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{pub.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      pub.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {pub.isActive ? "Активна" : "Черновик"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-[#8814B1]">
                      {pub.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-4">
                    <p className="text-sm text-gray-500 line-clamp-2">{pub.content || "Описание отсутствует"}</p>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                       <FiExternalLink className="shrink-0" />
                       <a href={pub.targetUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                         {pub.targetUrl}
                       </a>
                    </div>
                  </div>

                  {/* Tracking Section */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => copyTrackingLink(pub._id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                      Копировать Tracking Link
                    </button>
                    
                    {pub.lastBroadcastAt && (
                      <span className="text-[11px] text-gray-400 italic">
                        Последняя рассылка: {new Date(pub.lastBroadcastAt).toLocaleString("ru-RU")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="md:w-64 flex flex-row md:flex-col gap-4 justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-center md:text-left">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Охват</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-800">{pub.views.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">просмотров</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Конверсия</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#8814B1]">{pub.clicks.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">кликов</span>
                      <span className="ml-2 px-2 py-0.5 bg-purple-50 text-[#8814B1] text-[10px] font-bold rounded">
                        {calculateCTR(pub.views, pub.clicks)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleBroadcast(pub._id)}
                    disabled={broadcastingId === pub._id || !pub.isActive}
                    className="p-3 text-[#8814B1] hover:bg-purple-50 rounded-xl transition-all shadow-sm border border-purple-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Разослать в Telegram"
                  >
                    <FiSend className={`w-5 h-5 ${broadcastingId === pub._id ? "animate-pulse" : ""}`} />
                  </button>
                  <Link
                    href={`/admin/publications/${pub._id}/edit`}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-blue-100"
                    title="Редактировать"
                  >
                    <FiEdit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(pub._id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100"
                    title="Удалить"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
