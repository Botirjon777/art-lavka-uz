"use client";

import { useState } from "react";
import { useAdminOrders } from "../hooks/useOrders";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { Order, OrderStatus } from "@/types";

export default function OrderList() {
  const { data: orders = [], isLoading: loading } = useAdminOrders();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order: Order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-purple-100 text-purple-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      paid: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Заказы</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Поиск</label>
            <input
              type="text"
              placeholder="Номер заказа, имя или телефон..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8814B1] focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex-col">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Все" },
                { value: "pending", label: "Ожидает" },
                { value: "confirmed", label: "Подтвержден" },
                { value: "processing", label: "В обработке" },
                { value: "shipped", label: "Отправлен" },
                { value: "delivered", label: "Доставлен" },
                { value: "cancelled", label: "Отменен" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value as OrderStatus | "all")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    filter === status.value
                      ? "bg-[#8814B1] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Загрузка заказов...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEye className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">Заказы не найдены</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры фильтрации</p>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">№ Заказа</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Клиент</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Товары</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Сумма</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Статус</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Оплата</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order: Order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-bold text-gray-900 group-hover:text-[#8814B1] transition-colors">{order.orderNumber}</span>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                        {order.items.length} тов.
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString()} <span className="text-[10px]">UZS</span></div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#8814B1] rounded-xl text-xs font-bold hover:bg-[#8814B1] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        Детали
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
