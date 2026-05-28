"use client";

import { Promotion, Product } from "@/types";
import { createPromotion, updatePromotion } from "../actions/promotions";
import { getProducts } from "@/features/admin/products/actions/products";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiSave,
  FiArrowLeft,
  FiTag,
  FiCalendar,
  FiTarget,
  FiBox,
  FiCheck,
  FiMapPin,
  FiMap,
} from "react-icons/fi";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";
import { LOCATIONS } from "@/lib/i18n/locations";

interface PromotionFormProps {
  initialData?: Promotion;
}

export default function PromotionForm({ initialData }: PromotionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const regionKeys = Object.keys(LOCATIONS);

  // Basic Info
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"global" | "targeted">(
    initialData?.type || "global",
  );
  const [conditionType, setConditionType] = useState<
    "min_items" | "min_amount" | "product_selected"
  >(initialData?.conditionType || "min_items");
  const [conditionValue, setConditionValue] = useState<any>(
    initialData?.conditionValue || "",
  );
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | "free_delivery"
  >(initialData?.discountType || "percentage");
  const [discountValue, setDiscountValue] = useState(
    initialData?.discountValue || 0,
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : "",
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
      : "",
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    initialData?.selectedRegions || [],
  );
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<
    Array<"door" | "pickup">
  >(initialData?.selectedDeliveryMethods || []);

  // Translations
  const [translations, setTranslations] = useState<
    Record<string, { name: string; description?: string }>
  >(
    initialData?.translations || {
      ru: { name: "" },
      uz: { name: "" },
      en: { name: "" },
    },
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProducts();
      setProducts(result);
    };
    fetchProducts();
  }, []);

  // Sync basic name with RU translation if empty
  useEffect(() => {
    if (!name && translations.ru.name) setName(translations.ru.name);
  }, [translations.ru.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Пожалуйста, выберите даты проведения акции");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("name", name || translations.ru.name);
    formData.set("type", type);
    formData.set("conditionType", conditionType);
    formData.set(
      "conditionValue",
      JSON.stringify(
        conditionType === "product_selected"
          ? Array.isArray(conditionValue)
            ? conditionValue
            : []
          : conditionValue,
      ),
    );
    formData.set("discountType", discountType);
    formData.set("discountValue", discountValue.toString());
    formData.set("isActive", isActive.toString());
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    formData.set("translations", JSON.stringify(translations));
    formData.set("selectedRegions", JSON.stringify(selectedRegions));
    formData.set(
      "selectedDeliveryMethods",
      JSON.stringify(selectedDeliveryMethods),
    );

    const result = initialData
      ? await updatePromotion(initialData._id, formData)
      : await createPromotion(formData);

    if (result.success) {
      toast.success(initialData ? "Акция обновлена" : "Акция создана");
      router.push("/admin/promotions");
    } else {
      toast.error(result.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  const handleProductToggle = (productId: string) => {
    const currentValues = Array.isArray(conditionValue) ? conditionValue : [];
    if (currentValues.includes(productId)) {
      setConditionValue(currentValues.filter((id) => id !== productId));
    } else {
      setConditionValue([...currentValues, productId]);
    }
  };

  const handleDeliveryMethodToggle = (method: "door" | "pickup") => {
    if (selectedDeliveryMethods.includes(method)) {
      setSelectedDeliveryMethods(
        selectedDeliveryMethods.filter((item) => item !== method),
      );
      return;
    }

    setSelectedDeliveryMethods([...selectedDeliveryMethods, method]);
  };

  return (
    <div className="max-w-full mx-auto pb-20">
      <div className="flex justify-between items-center mb-5">
        <Link
          href="/admin/promotions"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all"
        >
          <FiArrowLeft /> Назад к списку
        </Link>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-2xl transition-all shadow-lg shadow-purple-100 disabled:opacity-50 active:scale-95"
        >
          <FiSave />
          {loading ? "Сохранение..." : "Сохранить акцию"}
        </button>
      </div>

      <form className="space-y-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-sm p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-[#8814B1]">
              <FiTag size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Основная информация
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Настройте название и время проведения акции
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-sm p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Название (RU)
                </h3>
                <input
                  type="text"
                  value={translations.ru.name}
                  onChange={(e) =>
                    setTranslations({
                      ...translations,
                      ru: { ...translations.ru, name: e.target.value },
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] transition-all"
                  placeholder="Весенняя распродажа"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-sm p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Период действия
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                      Начало
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                      Конец
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-sm p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Название (UZ)
                </h3>
                <input
                  type="text"
                  value={translations.uz?.name || ""}
                  onChange={(e) =>
                    setTranslations({
                      ...translations,
                      uz: {
                        ...(translations.uz || { name: "" }),
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] transition-all"
                  placeholder="Bahorgi chegirmalar"
                />
              </div>

              <div className="bg-gray-50 rounded-sm p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Статус
                </h3>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-8 rounded-full transition-colors ${isActive ? "bg-[#8814B1]" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${isActive ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-700">
                    {isActive ? "Активна" : "Неактивна"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Rule & Mechanics Card */}
        <div className="bg-white rounded-sm p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <FiTarget size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Условие и Механика
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Определите правила срабатывания акции
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Condition Section */}
            <div className="space-y-6">
              <div className="bg-blue-50/30 rounded-3xl p-8 border border-blue-50">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6">
                  Когда срабатывает:
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-blue-400 uppercase mb-2">
                      Область применения
                    </label>
                    <Dropdown
                      label=""
                      options={[
                        { value: "global", label: "Глобальная (весь заказ)" },
                        {
                          value: "targeted",
                          label: "Целевая (конкретные товары)",
                        },
                      ]}
                      value={type}
                      onChange={(val) => {
                        setType(val as any);
                        if (val === "targeted")
                          setConditionType("product_selected");
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-blue-400 uppercase mb-2">
                      Тип условия
                    </label>
                    <Dropdown
                      label=""
                      options={
                        type === "global"
                          ? [
                              {
                                value: "min_items",
                                label: "Мин. количество товаров",
                              },
                              {
                                value: "min_amount",
                                label: "Мин. сумма заказа",
                              },
                            ]
                          : [
                              {
                                value: "product_selected",
                                label: "При выборе товаров",
                              },
                            ]
                      }
                      value={conditionType}
                      onChange={(val) => setConditionType(val as any)}
                    />
                  </div>

                  {conditionType !== "product_selected" && (
                    <Input
                      label={
                        conditionType === "min_items"
                          ? "Количество товаров"
                          : "Сумма в UZS"
                      }
                      type="number"
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                      placeholder={
                        conditionType === "min_items" ? "5" : "500000"
                      }
                      required
                    />
                  )}
                </div>
              </div>

              {conditionType === "product_selected" && (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Выберите товары:
                    </span>
                    <span className="text-[10px] font-bold bg-[#8814B1] text-white px-2 py-0.5 rounded-lg">
                      Выбрано:{" "}
                      {Array.isArray(conditionValue)
                        ? conditionValue.length
                        : 0}
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                    {products.map((product) => {
                      if (!product._id) return null;
                      const isSelected =
                        Array.isArray(conditionValue) &&
                        conditionValue.includes(product._id);

                      return (
                        <div
                          key={product._id}
                          onClick={() => handleProductToggle(product._id!)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-purple-50 border-purple-200 text-[#8814B1]"
                              : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#8814B1] border-[#8814B1]"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <FiCheck className="text-white w-3 h-3" />
                            )}
                          </div>
                          <img
                            src={product.image}
                            className="w-10 h-10 rounded-lg object-cover"
                            alt=""
                          />
                          <span className="font-bold text-sm truncate">
                            {product.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Discount Section */}
            <div className="space-y-6">
              <div className="bg-green-50/30 rounded-3xl p-8 border border-green-50">
                <h4 className="text-sm font-black text-green-900 uppercase tracking-widest mb-6">
                  Как рассчитывается:
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-green-400 uppercase mb-2">
                      Вид скидки
                    </label>
                    <Dropdown
                      label=""
                      options={[
                        { value: "percentage", label: "Процент (%)" },
                        { value: "fixed", label: "Фикс. сумма (UZS)" },
                        {
                          value: "free_delivery",
                          label: "Бесплатная доставка",
                        },
                      ]}
                      value={discountType}
                      onChange={(val) => setDiscountType(val as any)}
                    />
                  </div>

                  {discountType !== "free_delivery" && (
                    <Input
                      label={
                        discountType === "percentage"
                          ? "Процент скидки"
                          : "Сумма скидки (UZS)"
                      }
                      type="number"
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(parseFloat(e.target.value) || 0)
                      }
                      placeholder={
                        discountType === "percentage" ? "15" : "50000"
                      }
                      required
                    />
                  )}

                  {discountType === "free_delivery" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-green-400 uppercase">
                          Области действия
                        </label>
                        <button
                          type="button"
                          onClick={() => setSelectedRegions([])}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                            selectedRegions.length === 0
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          Весь Узбекистан
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                        {regionKeys.map((region) => {
                          const isSelected = selectedRegions.includes(region);
                          return (
                            <div
                              key={region}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedRegions(
                                    selectedRegions.filter((r) => r !== region),
                                  );
                                } else {
                                  setSelectedRegions([
                                    ...selectedRegions,
                                    region,
                                  ]);
                                }
                              }}
                              className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? "bg-green-600 border-green-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <FiCheck className="text-white w-2.5 h-2.5" />
                                )}
                              </div>
                              <span className="text-[10px] font-bold truncate">
                                {region}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {selectedRegions.length > 0 && (
                        <p className="text-[10px] text-gray-500 font-medium italic">
                          * Доставка будет бесплатной только для{" "}
                          {selectedRegions.length} выбранных областей.
                        </p>
                      )}
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-black text-green-400 uppercase">
                            Delivery methods
                          </label>
                          <button
                            type="button"
                            onClick={() => setSelectedDeliveryMethods([])}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                              selectedDeliveryMethods.length === 0
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            All methods
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "door" as const, label: "To door" },
                            { value: "pickup" as const, label: "Pickup point" },
                          ].map((method) => {
                            const isSelected = selectedDeliveryMethods.includes(
                              method.value,
                            );
                            return (
                              <div
                                key={method.value}
                                onClick={() =>
                                  handleDeliveryMethodToggle(method.value)
                                }
                                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? "bg-green-600 border-green-600"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <FiCheck className="text-white w-2.5 h-2.5" />
                                  )}
                                </div>
                                <span className="text-[10px] font-bold truncate">
                                  {method.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {selectedDeliveryMethods.length > 0 && (
                          <p className="text-[10px] text-gray-500 font-medium italic">
                            * Free delivery will work only for selected delivery
                            methods.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-white rounded-2xl border border-green-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                      <FiBox className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Резюме:</p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {type === "global" ? "Весь заказ" : "Выбранные товары"}{" "}
                        получит
                        <span className="text-[#8814B1] font-bold mx-1">
                          {discountType === "free_delivery"
                            ? "бесплатную доставку"
                            : `${discountValue}${discountType === "percentage" ? "%" : " UZS"}`}
                        </span>
                        {discountType === "free_delivery" &&
                          (selectedRegions.length === 0
                            ? "по всему Узбекистану"
                            : `в ${selectedRegions.length} регионах`)}{" "}
                        если{" "}
                        {conditionType === "min_items"
                          ? `в заказе >= ${conditionValue} товаров`
                          : conditionType === "min_amount"
                            ? `сумма заказа >= ${parseInt(conditionValue).toLocaleString()} UZS`
                            : "добавлен акционный товар"}
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
