"use client";

import { useState } from "react";
import { CartItem } from "@/types";
import { createOrder } from "@/app/actions/orders";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  onSuccess: (orderNumber: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSuccess,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [region, setRegion] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [homeNumber, setHomeNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Uzbekistan regions
  const uzbekistanRegions = [
    "город Ташкент",
    "Ташкентская область",
    "Андижанская область",
    "Бухарская область",
    "Ферганская область",
    "Джизакская область",
    "Хорезмская область",
    "Наманганская область",
    "Навоийская область",
    "Кашкадарьинская область",
    "Республика Каракалпакстан",
    "Самаркандская область",
    "Сырдарьинская область",
    "Сурхандарьинская область",
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName ||
      !customerPhone ||
      !region ||
      !streetAddress ||
      !homeNumber
    ) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    // Combine street address and home number only
    const fullAddress = `${streetAddress}, ${homeNumber}`;

    setIsSubmitting(true);

    try {
      // Transform cart items to order items
      const orderItems = items.map((item) => ({
        product: {
          _id: item.product._id || item.product.id || "",
          name: item.product.name,
          image: item.product.image,
          model: item.product.model,
          category: item.product.category,
        },
        print: item.print
          ? {
              _id: item.print._id || item.print.id || "",
              name: item.print.name,
              frontImage: item.print.frontImage,
              backImage: item.print.backImage,
            }
          : null,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrder({
        customerName,
        customerPhone,
        region,
        customerAddress: fullAddress,
        items: orderItems,
        totalAmount,
        notes: notes || `Telegram: ${telegramUsername}`,
      });

      if (result.success && result.order) {
        toast.success("Order placed successfully!");
        onSuccess(result.order.orderNumber);
        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setRegion("");
        setStreetAddress("");
        setHomeNumber("");
        setTelegramUsername("");
        setNotes("");
      } else {
        // Handle stock validation errors
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error: string) => {
            toast.error(error, { duration: 5000 });
          });
        } else {
          toast.error(result.error || "Failed to create order");
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("An error occurred while placing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[30px]/[37px] text-[#333333] font-medium">
              Оформление заказа
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-medium mb-2">Сводка заказа</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{items.length} товар(ов)</p>
              <p className="text-xl font-bold text-[#333333]">
                Итого: {totalAmount.toLocaleString()} UZS
              </p>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полное имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="Например: Алиев Вали"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="+998 XX XXX XX XX"
                required
              />
            </div>

            {/* Region */}
            <Dropdown
              label="Область/Город"
              value={region}
              onChange={(value) => setRegion(value)}
              options={uzbekistanRegions.map((r) => ({
                value: r,
                label: r,
              }))}
              placeholder="Выберите область"
              required
            />

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес улицы <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="Например: улица Амира Темура, дом 15"
                required
              />
            </div>

            {/* Home/Apartment Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер дома/квартиры <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={homeNumber}
                onChange={(e) => setHomeNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="Например: квартира 12"
                required
              />
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телеграм юзернэйм
              </label>
              <input
                type="text"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Примечания к заказу (необязательно)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] resize-none"
                rows={2}
                placeholder="Любые особые пожелания к заказу?"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#00C6F1] text-white rounded-lg hover:bg-[#00C6F1]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Оформление..." : "Оформить заказ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
