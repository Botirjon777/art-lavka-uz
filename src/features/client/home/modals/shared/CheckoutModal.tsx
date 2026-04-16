"use client";

import { useState } from "react";
import { CartItem } from "@/types";
import { createOrder } from "@/features/admin/orders/actions/orders";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import MobileModal from "../mobile/MobileModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { normalizePhoneNumber, applyPhoneMask } from "@/lib/phoneUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { LOCATIONS } from "@/lib/i18n/locations";
import {
  DELIVERY_PRICES,
  getBranches,
  DeliveryBranch,
} from "@/lib/deliveryData";

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
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [region, setRegion] = useState("");
  const [village, setVillage] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [homeNumber, setHomeNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Delivery State
  const [deliveryMethod, setDeliveryMethod] = useState<"door" | "pickup">(
    "door",
  );
  const [selectedBranch, setSelectedBranch] = useState<DeliveryBranch | null>(
    null,
  );

  // Get regions list from locations data (Russian keys)
  const regionKeys = Object.keys(LOCATIONS);

  // Use translated regions from locale file for labels
  const uzbekistanRegions = t.regions as string[];

  // Get available districts for selected region
  const availableDistricts = region
    ? LOCATIONS[region as keyof typeof LOCATIONS] || []
    : [];

  // Get branches for current location if in pickup mode
  const branches = region && village ? getBranches(region, village) : [];

  const deliveryPrice = DELIVERY_PRICES[deliveryMethod];
  const finalTotal = totalAmount + deliveryPrice;

  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = t.errorNameRequired;
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = t.errorNameShort;
    }

    const digits = customerPhone.replace(/\D/g, "");
    if (!customerPhone.trim()) {
      newErrors.customerPhone = t.errorPhoneRequired;
    } else if (digits.length !== 9) {
      newErrors.customerPhone = t.errorPhoneInvalid;
    }

    if (!region) {
      newErrors.region = t.errorRegionRequired;
    }

    if (!village) {
      newErrors.village = t.villagePlaceholder;
    }

    if (deliveryMethod === "door") {
      if (!streetAddress.trim()) {
        newErrors.streetAddress = t.errorStreetRequired;
      }
      if (!homeNumber.trim()) {
        newErrors.homeNumber = t.errorHomeRequired;
      }
    } else {
      if (!selectedBranch) {
        newErrors.branch = t.selectBranch;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t.errorFormFix);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product: {
          _id: (item.product._id || item.product.id || "").toString(),
          name: getTranslated(item.product, lang),
          image: item.product.image,
          model: item.product.model || "",
          category: item.product.category || "",
        },
        print: item.print
          ? {
              _id: (item.print._id || item.print.id || "").toString(),
              name: getTranslated(item.print, lang),
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
        village,
        deliveryMethod,
        branch: selectedBranch?.name,
        deliveryPrice,
        customerAddress:
          deliveryMethod === "door"
            ? `${streetAddress}, ${homeNumber}`
            : selectedBranch?.address || "",
        items: orderItems,
        totalAmount: finalTotal,
        notes: notes || `Telegram: ${telegramUsername}`,
      });

      if (result.success && result.order) {
        toast.success(t.orderSuccess);
        onSuccess(result.order.orderNumber);
        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setRegion("");
        setVillage("");
        setDeliveryMethod("door");
        setSelectedBranch(null);
        setStreetAddress("");
        setHomeNumber("");
        setTelegramUsername("");
        setNotes("");
      } else {
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
            <h2 className="text-[22px]/[27px] text-[#333333] font-bold">
              {t.checkoutTitle}
            </h2>
          </div>

          {/* Order Summary */}
          <div className="mb-5 p-4 bg-white shadow-lg rounded-xl border border-gray-100">
            <h3 className="text-[16px]/[20px] font-bold mb-3">
              {t.orderSummary}
            </h3>
            <div className="space-y-2 text-[14px]/[17px]">
              <div className="flex justify-between items-center text-[#666666]">
                <span>{t.itemsTotal}:</span>
                <span className="font-medium text-[#333333]">
                  {totalAmount.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#666666]">
                <span>
                  {t.deliveryPrice} (
                  {deliveryMethod === "door" ? t.toDoor : t.toPunct}):
                </span>
                <span className="font-medium text-[#333333]">
                  {deliveryPrice.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between items-center text-[16px]/[20px] font-bold text-[#8814B1]">
                <span>{t.total}:</span>
                <span>
                  {finalTotal.toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName)
                    setErrors({ ...errors, customerName: "" });
                }}
                className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                  errors.customerName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
                placeholder={t.fullNamePlaceholder}
              />
              {errors.customerName && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                {t.phoneNumber} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  +998
                </span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(applyPhoneMask(e.target.value));
                    if (errors.customerPhone)
                      setErrors({ ...errors, customerPhone: "" });
                  }}
                  className={`w-full pl-13 pr-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                    errors.customerPhone
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder="XX XXX XX XX"
                />
              </div>
              {errors.customerPhone && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.customerPhone}
                </p>
              )}
            </div>

            {/* Delivery Method Selection */}
            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-2">
                {t.deliveryMethod} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("door")}
                  className={`py-2.5 px-3 rounded-xl border text-[13px]/[16px] transition-all ${
                    deliveryMethod === "door"
                      ? "bg-[#8814B1] text-white border-[#8814B1] shadow-md"
                      : "bg-white text-[#333333] border-gray-200"
                  }`}
                >
                  {t.toDoor}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod("pickup");
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-[13px]/[16px] transition-all ${
                    deliveryMethod === "pickup"
                      ? "bg-[#8814B1] text-white border-[#8814B1] shadow-md"
                      : "bg-white text-[#333333] border-gray-200"
                  }`}
                >
                  {t.toPunct}
                </button>
              </div>
            </div>

            {/* Region */}
            <Dropdown
              label={t.region}
              value={region}
              error={errors.region}
              onChange={(value) => {
                setRegion(value);
                setVillage("");
                setSelectedBranch(null);
                if (errors.region)
                  setErrors({ ...errors, region: "", village: "" });
              }}
              options={regionKeys.map((key, index) => ({
                value: key,
                label: uzbekistanRegions[index] || key,
              }))}
              placeholder={t.regionPlaceholder}
              buttonClassName="px-2.5 py-2 text-[14px]/[17px]"
            />

            {/* Village / District */}
            <Dropdown
              label={t.village}
              value={village}
              error={errors.village}
              onChange={(value) => {
                setVillage(value);
                setSelectedBranch(null);
                setStreetAddress("");
                if (errors.village) setErrors({ ...errors, village: "" });
              }}
              options={availableDistricts.map((d) => ({
                value: d.ru,
                label: d[lang as keyof typeof d] || d.ru,
              }))}
              placeholder={t.villagePlaceholder}
              disabled={!region}
              buttonClassName="px-2.5 py-2 text-[14px]/[17px]"
            />

            {/* Delivery Details */}
            {deliveryMethod === "pickup" ? (
              <Dropdown
                label={t.selectBranch}
                value={selectedBranch?.id || ""}
                error={errors.branch}
                onChange={(id) => {
                  const branch = branches.find((b) => b.id === id);
                  if (branch) {
                    setSelectedBranch(branch);
                    setStreetAddress(branch.address);
                    if (errors.branch) setErrors({ ...errors, branch: "" });
                  }
                }}
                options={branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
                placeholder={t.selectBranch}
                disabled={!village}
                buttonClassName="px-2.5 py-2 text-[14px]/[17px]"
              />
            ) : (
              <>
                <div>
                  <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                    {t.streetAddress} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      if (errors.streetAddress)
                        setErrors({ ...errors, streetAddress: "" });
                    }}
                    className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                      errors.streetAddress
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.streetAddressPlaceholder}
                  />
                  {errors.streetAddress && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                    {t.homeNumber} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={homeNumber}
                    onChange={(e) => {
                      setHomeNumber(e.target.value);
                      if (errors.homeNumber)
                        setErrors({ ...errors, homeNumber: "" });
                    }}
                    className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[14px]/[17px] ${
                      errors.homeNumber
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.homeNumberPlaceholder}
                  />
                  {errors.homeNumber && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.homeNumber}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px]/[16px] text-[#333333] mb-1">
                {t.telegramUsername}
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
                {t.notes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] resize-none text-[14px]/[17px]"
                rows={2}
                placeholder={t.notesPlaceholder}
              />
            </div>

            <div className="flex gap-2.5 pt-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-[13px]/[16px]"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#8814B1] text-white rounded-lg hover:bg-[#8814B1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[13px]/[16px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.submitting : t.submit}
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
      <div className="bg-white rounded-[30px] w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[30px]/[37px] text-[#333333] font-medium">
              {t.checkoutTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#8814B1] text-[30px]/[37px] cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-6 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h3 className="text-[20px]/[24px] font-bold mb-4">
              {t.orderSummary}
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[16px]/[20px]">
              <div className="flex justify-between items-center text-[#666666]">
                <span>{t.itemsTotal}:</span>
                <span className="font-medium text-[#333333]">
                  {totalAmount.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#666666]">
                <span>
                  {t.deliveryPrice} (
                  {deliveryMethod === "door" ? t.toDoor : t.toPunct}):
                </span>
                <span className="font-medium text-[#333333]">
                  {deliveryPrice.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="col-span-2 h-px bg-gray-100 my-2" />
              <div className="col-span-2 flex justify-between items-center text-[24px]/[30px] font-bold text-[#00C6F1]">
                <span>{t.total}:</span>
                <span>
                  {finalTotal.toLocaleString()} {t.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName)
                      setErrors({ ...errors, customerName: "" });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                    errors.customerName
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder={t.fullNamePlaceholder}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phoneNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    +998
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(applyPhoneMask(e.target.value));
                      if (errors.customerPhone)
                        setErrors({ ...errors, customerPhone: "" });
                    }}
                    className={`w-full pl-15 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                      errors.customerPhone
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder="XX XXX XX XX"
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.deliveryMethod} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("door")}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all font-medium text-[16px] cursor-pointer ${
                    deliveryMethod === "door"
                      ? "bg-[#00C6F1] text-white border-[#00C6F1] shadow-lg scale-[1.02]"
                      : "bg-white text-[#333333] border-gray-100 hover:border-[#00C6F1]"
                  }`}
                >
                  {t.toDoor}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all font-medium text-[16px] cursor-pointer ${
                    deliveryMethod === "pickup"
                      ? "bg-[#00C6F1] text-white border-[#00C6F1] shadow-lg scale-[1.02]"
                      : "bg-white text-[#333333] border-gray-100 hover:border-[#00C6F1]"
                  }`}
                >
                  {t.toPunct}
                </button>
              </div>
            </div>

            {/* Region & Village */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Dropdown
                  label={t.region}
                  value={region}
                  error={errors.region}
                  onChange={(value) => {
                    setRegion(value);
                    setVillage("");
                    setSelectedBranch(null);
                    if (errors.region)
                      setErrors({ ...errors, region: "", village: "" });
                  }}
                  options={regionKeys.map((key, index) => ({
                    value: key,
                    label: uzbekistanRegions[index] || key,
                  }))}
                  placeholder={t.regionPlaceholder}
                />
              </div>
              <div className="flex-1">
                <Dropdown
                  label={t.village}
                  value={village}
                  error={errors.village}
                  onChange={(value) => {
                    setVillage(value);
                    setSelectedBranch(null);
                    setStreetAddress("");
                    if (errors.village) setErrors({ ...errors, village: "" });
                  }}
                  options={availableDistricts.map((d) => ({
                    value: d.ru,
                    label: d[lang as keyof typeof d] || d.ru,
                  }))}
                  placeholder={t.villagePlaceholder}
                  disabled={!region}
                />
              </div>
            </div>

            {/* Delivery Details */}
            {deliveryMethod === "pickup" ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <Dropdown
                    label={t.selectBranch}
                    value={selectedBranch?.id || ""}
                    error={errors.branch}
                    onChange={(id) => {
                      const branch = branches.find((b) => b.id === id);
                      if (branch) {
                        setSelectedBranch(branch);
                        setStreetAddress(branch.address);
                        if (errors.branch) setErrors({ ...errors, branch: "" });
                      }
                    }}
                    options={branches.map((b) => ({
                      value: b.id,
                      label: b.name,
                    }))}
                    placeholder={t.selectBranch}
                    disabled={!village}
                  />
                </div>
                {selectedBranch && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.streetAddress}
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 h-[50px] flex items-center">
                      {selectedBranch.address}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.streetAddress} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => {
                      setStreetAddress(e.target.value);
                      if (errors.streetAddress)
                        setErrors({ ...errors, streetAddress: "" });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                      errors.streetAddress
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.streetAddressPlaceholder}
                  />
                  {errors.streetAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.homeNumber} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={homeNumber}
                    onChange={(e) => {
                      setHomeNumber(e.target.value);
                      if (errors.homeNumber)
                        setErrors({ ...errors, homeNumber: "" });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] ${
                      errors.homeNumber
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.homeNumberPlaceholder}
                  />
                  {errors.homeNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.homeNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.telegramUsername}
                </label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                  placeholder="@username"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] resize-none"
                  rows={1}
                  placeholder={t.notesPlaceholder}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#00C6F1] text-white rounded-lg hover:bg-[#00C6F1]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
