"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiSearch, FiX, FiCheck, FiFilter } from "react-icons/fi";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";
import { getMediaHistory, MediaItem } from "../actions/media";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchMedia = async () => {
    setLoading(true);
    const result = await getMediaHistory();
    if (result.success && result.data) {
      setMedia(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "all" || item.source === filter;

    return matchesSearch && matchesFilter;
  });

  const sources = ["all", ...new Set(media.map((item) => item.source))];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[800px] max-w-[90vw] h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">История медиа-файлов</h2>
            <p className="text-sm text-gray-500">Выберите ранее загруженное изображение для повторного использования</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или ссылке..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8814B1] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide">
              {sources.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    filter === s
                      ? "bg-[#8814B1] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {s === "all" ? "Все источники" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
               <FiCheck className="w-12 h-12 opacity-20" />
               <p className="text-sm">Изображения не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
              {filteredMedia.map((item, index) => (
                <button
                  key={item.url + index}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-[#8814B1] hover:ring-2 hover:ring-[#8814B1]/10 transition-all shadow-sm"
                >
                  <Image
                    src={item.url}
                    alt={item.name || "Media History"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="200px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-left translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] text-white font-bold truncate leading-tight">{item.name || "Без названия"}</p>
                    <p className="text-[9px] text-purple-200 uppercase tracking-wider font-extrabold">{item.source}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
