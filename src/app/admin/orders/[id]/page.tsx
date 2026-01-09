"use client";

import { useState, useEffect } from "react";
import { getOrderById, updateOrderStatus } from "@/app/actions/orders";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import Dropdown from "@/components/ui/Dropdown";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    const data = await getOrderById(params.id as string);
    setOrder(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrderStatus(order._id!, status);

    if (result.success) {
      toast.success("Статус заказа обновлен");
      setOrder(result.order);
    } else {
      toast.error(result.error || "Не удалось обновить статус");
    }
    setUpdating(false);
  };

  const handlePaymentStatusUpdate = async (paymentStatus: PaymentStatus) => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrderStatus(
      order._id!,
      order.status,
      paymentStatus
    );

    if (result.success) {
      toast.success("Статус оплаты обновлен");
      setOrder(result.order);
    } else {
      toast.error(result.error || "Не удалось обновить статус оплаты");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка заказа...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Заказ не найден</p>
        <Link
          href="/admin/orders"
          className="text-[#8814B1] hover:text-[#8814B1]/80"
        >
          Вернуться к заказам
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Детали заказа</h1>
          <p className="text-gray-600">{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Товары в заказе</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.size} • {item.color}
                    </p>
                    {item.print && (
                      <p className="text-sm text-gray-600">
                        Принт:{" "}
                        <span className="text-[#00C6F1]">
                          {item.print.name}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Количество: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} UZS
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Итого</span>
                <span className="text-2xl font-bold text-[#8814B1]">
                  {order.totalAmount.toLocaleString()} UZS
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Информация о клиенте</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Имя</label>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Телефон</label>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Регион</label>
                <p className="font-medium">{order.region}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Адрес доставки</label>
                <p className="font-medium">{order.customerAddress}</p>
              </div>
              {order.notes && (
                <div>
                  <label className="text-sm text-gray-600">Заметки</label>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Статус заказа</h2>
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

          {/* Payment Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Статус оплаты</h2>
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

          {/* Order Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Информация о заказе</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Создан</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Обновлен</span>
                <span className="font-medium">
                  {new Date(order.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
