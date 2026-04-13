"use client";

import { useOrderById, useUpdateOrderStatus } from "../hooks/useOrders";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
} from "react-icons/fi";
import { OrderItem, OrderStatus, PaymentStatus } from "@/types";
import Dropdown from "@/components/ui/Dropdown";
import Loader from "@/components/Loader";
import { formatPhoneNumber } from "@/lib/phoneUtils";

export default function OrderDetail() {
  const params = useParams();
  const { data: order, isLoading: loading } = useOrderById(params.id as string);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;
    updateStatusMutation.mutate({ id: order._id!, status });
  };

  const handlePaymentStatusUpdate = async (paymentStatus: PaymentStatus) => {
    if (!order) return;
    updateStatusMutation.mutate({
      id: order._id!,
      status: order.status,
      paymentStatus,
    });
  };

  const updating = updateStatusMutation.isPending;

  if (loading) {
    return <Loader />;
  }

  if (!order) {
    return (
      <div className="text-center py-20 px-8 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
        <FiXCircle className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <p className="text-gray-600 font-bold text-xl mb-4">Заказ не найден</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#8814B1] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          <FiArrowLeft /> Вернуться к заказам
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <Link
            href="/admin/orders"
            className="p-3 bg-white border border-gray-100 hover:border-[#8814B1] hover:text-[#8814B1] rounded-[18px] transition-all shadow-sm group"
          >
            <FiArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-purple-100 text-[#8814B1]"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-gray-400 font-medium mt-0.5">
              Создан {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-[22px] border border-gray-100 shadow-sm">
          <div className="px-5 py-2">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
              Сумма заказа
            </p>
            <p className="text-xl font-black text-gray-900">
              {order.totalAmount.toLocaleString()}{" "}
              <span className="text-xs">UZS</span>
            </p>
          </div>
          <div className="w-px h-10 bg-gray-100 mx-2" />
          <div className="px-5 py-2">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
              Оплата
            </p>
            <p
              className={`text-sm font-bold ${order.paymentStatus === "paid" ? "text-green-600" : "text-orange-500"}`}
            >
              {order.paymentStatus === "paid" ? "Оплачено" : "Ожидание"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <FiPackage className="text-[#8814B1]" />
                Товары в заказе
              </h2>
              <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold ring-1 ring-gray-100">
                {order.items.length} объекта(-ов)
              </span>
            </div>
            <div className="space-y-6">
              {order.items.map((item: OrderItem, index: number) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50/50 hover:bg-gray-50 rounded-[28px] border border-gray-100 transition-colors"
                >
                  <div className="relative w-28 h-28 bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="font-black text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}{" "}
                        <span className="text-[10px] font-bold">UZS</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-white border border-gray-100 text-xs font-bold text-gray-600 rounded-full">
                        Размер: {item.size}
                      </span>
                      <span className="px-3 py-1 bg-white border border-gray-100 text-xs font-bold text-gray-600 rounded-full">
                        Цвет: {item.color}
                      </span>
                    </div>

                    {item.print && (
                      <div className="mt-4 flex flex-col gap-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Выбранный принт:{" "}
                          <span className="text-[#8814B1]">
                            {item.print.name}
                          </span>
                        </p>
                        <div className="flex gap-3">
                          <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden border border-purple-100 shadow-sm group">
                            <Image
                              src={item.print.frontImage}
                              alt="Front Print"
                              fill
                              className="object-contain p-1 group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[8px] text-white text-center py-0.5 font-bold">
                              FRONT
                            </div>
                          </div>
                          {item.print.backImage && (
                            <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden border border-purple-100 shadow-sm group">
                              <Image
                                src={item.print.backImage}
                                alt="Back Print"
                                fill
                                className="object-contain p-1 group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[8px] text-white text-center py-0.5 font-bold">
                                BACK
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-8">
              <FiInfo className="text-[#8814B1]" />
              Информация о доставке
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Получатель
                </label>
                <p className="font-bold text-gray-900 text-lg">
                  {order.customerName}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Телефон
                </label>
                <p className="font-bold text-gray-900 text-lg">
                  {formatPhoneNumber(order.customerPhone)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Регион
                </label>
                <p className="font-bold text-gray-900 text-lg">
                  {order.region}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Адрес
                </label>
                <p className="font-bold text-gray-900 text-lg leading-snug">
                  {order.customerAddress}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-8 pt-8 border-t border-gray-50 space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                  Комментарий к заказу
                </label>
                <div className="p-4 bg-gray-50 rounded-2xl italic text-gray-600 font-medium border-l-4 border-purple-200">
                  {order.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status Controls */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiTruck className="text-[#8814B1]" />
                  Статус логистики
                </h3>
                <Dropdown
                  value={order.status}
                  onChange={(value) => handleStatusUpdate(value as OrderStatus)}
                  disabled={updating}
                  options={[
                    { value: "pending", label: "Ожидает" },
                    { value: "confirmed", label: "Подтвержден" },
                    { value: "processing", label: "В обработке" },
                    { value: "shipped", label: "Отправлен" },
                    { value: "delivered", label: "Доставлен" },
                    { value: "cancelled", label: "Отменен" },
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiCheckCircle className="text-green-500" />
                  Статус финансов
                </h3>
                <Dropdown
                  value={order.paymentStatus}
                  onChange={(value) =>
                    handlePaymentStatusUpdate(value as PaymentStatus)
                  }
                  disabled={updating}
                  options={[
                    { value: "pending", label: "Ожидает" },
                    { value: "paid", label: "Оплачено" },
                    { value: "failed", label: "Ошибка" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Timeline / System Info */}
          <div className="bg-linear-to-br from-[#8814B1] to-[#701091] rounded-[32px] p-8 text-white shadow-xl shadow-purple-200/50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-lg">
                <FiInfo className="w-4 h-4" />
              </span>
              Логи системы
            </h3>
            <div className="space-y-6">
              <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-white before:rounded-full">
                <p className="text-[10px] text-purple-200 uppercase font-black tracking-widest mb-1">
                  Создан в базе
                </p>
                <p className="text-sm font-bold">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-white/40 before:rounded-full">
                <p className="text-[10px] text-purple-200 uppercase font-black tracking-widest mb-1">
                  Последнее обновление
                </p>
                <p className="text-sm font-bold">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/20"
            >
              Распечатать чек
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
