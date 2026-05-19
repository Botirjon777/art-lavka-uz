"use client";

import { useState, useEffect } from "react";
import { getSupportRequests, updateOrderStatus, deleteSupportRequest } from "../../orders/actions/orders";
import { FiSearch, FiMessageSquare, FiCheck, FiTrash2, FiX } from "react-icons/fi";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

interface SupportRequest {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | string;
  createdAt: string;
}

export default function SupportList() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getSupportRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch support requests:", error);
      toast.error("Не удалось загрузить сообщения поддержки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        toast.success("Статус сообщения успешно обновлен");
        // Update local state
        setRequests(prev =>
          prev.map(req => (req._id === id ? { ...req, status: newStatus } : req))
        );
      } else {
        toast.error(res.error || "Не удалось обновить статус");
      }
    } catch (error) {
      console.error("Error updating support status:", error);
      toast.error("Произошла ошибка при обновлении статуса");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить это сообщение поддержки?")) {
      return;
    }

    try {
      const res = await deleteSupportRequest(id);
      if (res.success) {
        toast.success("Сообщение успешно удалено");
        setRequests(prev => prev.filter(req => req._id !== id));
      } else {
        toast.error(res.error || "Не удалось удалить сообщение");
      }
    } catch (error) {
      console.error("Error deleting support request:", error);
      toast.error("Произошла ошибка при удалении сообщения");
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === "all" || req.status === filter;
    
    // Clean name from potential [SUPPORT] prefix in display
    const displayName = req.customerName.replace("[SUPPORT] ", "");
    
    const matchesSearch =
      req.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerPhone.includes(searchQuery) ||
      (req.notes && req.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesFilter && matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидает";
      case "confirmed":
        return "Обработано";
      case "cancelled":
        return "Отменено";
      default:
        return status;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Сообщения поддержки</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Поиск</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по имени, телефону, сообщению или номеру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-col">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Все" },
                { value: "pending", label: "Ожидает" },
                { value: "confirmed", label: "Обработано" },
                { value: "cancelled", label: "Отменено" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    filter === tab.value
                      ? "bg-[#8814B1] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">Сообщения не найдены</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска или фильтрации</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-[160px]">ID / Дата</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-[200px]">Отправитель</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Сообщение</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest w-[140px]">Статус</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right w-[200px]">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRequests.map((req) => {
                  const displayName = req.customerName.replace("[SUPPORT] ", "");
                  return (
                    <tr key={req._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 align-top">
                        <span className="font-bold text-gray-900 group-hover:text-[#8814B1] transition-colors block">{req.orderNumber}</span>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                        <a 
                          href={`tel:${req.customerPhone}`} 
                          className="text-xs text-[#8814B1] hover:underline mt-1 block font-medium"
                        >
                          {req.customerPhone}
                        </a>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{req.notes || "Без сообщения"}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter inline-block mt-0.5 ${getStatusBadgeColor(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top text-right">
                        <div className="flex gap-2 justify-end">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req._id, "confirmed")}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                title="Отметить как обработано"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                                Решено
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req._id, "cancelled")}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                title="Отклонить"
                              >
                                <FiX className="w-3.5 h-3.5" />
                                Отклонить
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="inline-flex items-center justify-center p-2.5 bg-gray-50 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Удалить сообщение"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
