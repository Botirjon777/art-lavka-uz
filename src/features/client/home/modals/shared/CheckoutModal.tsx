"use client";

import { useState } from "react";
import { CartItem } from "@/types";
import { createOrder } from "@/features/admin/orders/actions/orders";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import MobileModal from "../mobile/MobileModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerName.trim()) {
      newErrors.customerName = "Введите ваше имя";
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = "Имя слишком короткое";
    }

    // Basic Uzbekistan phone regex: +998 followed by 9 digits
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$|^998\d{9}$|^\d{9}$/;
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Введите номер телефона";
    } else if (!phoneRegex.test(customerPhone.replace(/\s/g, ""))) {
      newErrors.customerPhone = "Неверный формат номера (+998XXXXXXXXX)";
    }

    if (!region) {
      newErrors.region = "Выберите область";
    }

    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Введите адрес улицы";
    }

    if (!homeNumber.trim()) {
      newErrors.homeNumber = "Введите номер дома/квартиры";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    // Combine street address and home number only
    const fullAddress = `${streetAddress}, ${homeNumber}`;

    setIsSubmitting(true);

    try {
      // Transform cart items to order items
      const orderItems = items.map((item) => ({
        product: {
          _id: (item.product._id || item.product.id || "").toString(),
          name: item.product.name,
          image: item.product.image,
          model: item.product.model || "",
          category: item.product.category || "",
        },
        print: item.print
          ? {
              _id: (item.print._id || item.print.id || "").toString(),
              name: item.print.name,
              frontImage: item.print.frontImage,
              backImage: item.print.backImage || "",
            }
          : null,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrder({
        customerName,
        customerPhone: normalizePhoneNumber(customerPhone),
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

  // Mobile version
  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose}>
        <div className="p-2.5">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-[22px]/[27px] text-[#333333]">
              Оформление заказа
            </h2>
          </div>

          {/* Order Summary */}
          <div className="mb-5 p-2.5 bg-white shadow-lg rounded-xl">
            <h3 className="text-[16px]/[20px] mb-2">Сводка заказа</h3>
            <div className="space-y-1 text-[13px]/[16px] text-[#666666]">
              <p>{items.length} товар(ов)</p>
              <p className="text-[16px]/[20px] text-[#333333]">
                Итого: {totalAmount.toLocaleString()} UZS
              </p>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Полное имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors({ ...errors, customerName: "" });
                }}
                className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                  errors.customerName ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
                placeholder="Например: Алиев Вали"
              />
              {errors.customerName && (
                <p className="text-red-500 text-[11px] mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.customerPhone) setErrors({ ...errors, customerPhone: "" });
                }}
                className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                  errors.customerPhone ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
                placeholder="+998 XX XXX XX XX"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-[11px] mt-1">{errors.customerPhone}</p>
              )}
            </div>

            {/* Region */}
            <Dropdown
              label="Область/Город"
              value={region}
              error={errors.region}
              onChange={(value) => {
                setRegion(value);
                if (errors.region) setErrors({ ...errors, region: "" });
              }}
              options={uzbekistanRegions.map((r) => ({
                value: r,
                label: r,
              }))}
              placeholder="Выберите область"
              buttonClassName="px-2.5 py-2 text-[14px]/[17px]"
            />

            {/* Street Address */}
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Адрес улицы <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  if (errors.streetAddress) setErrors({ ...errors, streetAddress: "" });
                }}
                className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                  errors.streetAddress ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
                placeholder="Например: улица Амира Темура, дом 15"
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-[11px] mt-1">{errors.streetAddress}</p>
              )}
            </div>

            {/* Home/Apartment Number */}
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Номер дома/квартиры <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={homeNumber}
                onChange={(e) => {
                  setHomeNumber(e.target.value);
                  if (errors.homeNumber) setErrors({ ...errors, homeNumber: "" });
                }}
                className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                  errors.homeNumber ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
                placeholder="Например: квартира 12"
              />
              {errors.homeNumber && (
                <p className="text-red-500 text-[11px] mt-1">{errors.homeNumber}</p>
              )}
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Телеграм юзернэйм
              </label>
              <input
                type="text"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px]"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                Примечания к заказу (необязательно)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] resize-none text-[14px]/[17px]"
                rows={2}
                placeholder="Любые особые пожелания к заказу?"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-[13px]/[16px]"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#8814B1] text-white rounded-lg hover:bg-[#8814B1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[13px]/[16px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Оформление..." : "Оформить заказ"}
              </button>
            </div>
          </form>
        </div>
      </MobileModal>
    );
  }

  // Desktop version
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] w-full max-w-5xl max-h-[90vh]">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[30px]/[37px] text-[#333333] font-medium">
              Оформление заказа
            </h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#8814B1] text-[30px]/[37px] cursor-pointer"
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
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Полное имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors({ ...errors, customerName: "" });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                    errors.customerName ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                  }`}
                  placeholder="Например: Алиев Вали"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) setErrors({ ...errors, customerPhone: "" });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                    errors.customerPhone ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                  }`}
                  placeholder="+998 XX XXX XX XX"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Region */}
            <Dropdown
              label="Область/Город"
              value={region}
              error={errors.region}
              onChange={(value) => {
                setRegion(value);
                if (errors.region) setErrors({ ...errors, region: "" });
              }}
              options={uzbekistanRegions.map((r) => ({
                value: r,
                label: r,
              }))}
              placeholder="Выберите область"
            />

            {/* Street Address */}
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес улицы <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => {
                    setStreetAddress(e.target.value);
                    if (errors.streetAddress) setErrors({ ...errors, streetAddress: "" });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                    errors.streetAddress ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                  }`}
                  placeholder="Например: улица Амира Темура, дом 15"
                />
                {errors.streetAddress && (
                  <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
                )}
              </div>
              {/* Home/Apartment Number */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер дома/квартиры <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={homeNumber}
                  onChange={(e) => {
                    setHomeNumber(e.target.value);
                    if (errors.homeNumber) setErrors({ ...errors, homeNumber: "" });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                    errors.homeNumber ? "border-red-500 focus:ring-red-200" : "border-gray-300"
                  }`}
                  placeholder="Например: квартира 12"
                />
                {errors.homeNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.homeNumber}</p>
                )}
              </div>
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
                className="flex-1 px-6 py-3 border-2 cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#00C6F1] cursor-pointer text-white rounded-lg hover:bg-[#00C6F1]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
