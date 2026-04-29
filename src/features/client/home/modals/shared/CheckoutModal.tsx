"use client";

import { useState, useEffect } from "react";
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
  calculateDeliveryPrice,
  getBranches,
  DeliveryBranch,
} from "@/lib/deliveryData";
import { usePromotions } from "@/features/client/home/hooks/usePromotions";
import { calculateBTSDelivery } from "@/lib/deliveryDataBTS";
// import btsOffices from "@/lib/btsOffices.json"; // Removed static import
import PromotionNudge from "../../components/PromotionNudge";
import { Promotion, Office } from "@/types";

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

  // Checkout State
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

  // Offices State
  const [allOffices, setAllOffices] = useState<Office[]>([]);

  // Nudge State
  const [showNudge, setShowNudge] = useState(false);
  const [nearMissPromo, setNearMissPromo] = useState<Promotion | null>(null);
  const [hasShownNudgeForRegion, setHasShownNudgeForRegion] = useState<
    string | null
  >(null);
  const [deliverySettings, setDeliverySettings] = useState<{
    deliveryPrices: Record<string, number[]>;
    courierFees: { upto10kg: number; upto20kg: number };
  } | null>(null);

  // Delivery State
  const [deliveryMethod, setDeliveryMethod] = useState<"door" | "pickup">(
    "door",
  );
  const [selectedBranch, setSelectedBranch] = useState<DeliveryBranch | null>(
    null,
  );

  // Load dynamic offices
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const [officesRes, settingsRes] = await Promise.all([
          fetch("/api/offices"),
          fetch("/api/settings"),
        ]);

        const officesData = await officesRes.json();
        if (officesData.success) {
          setAllOffices(officesData.data);
        }

        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          setDeliverySettings({
            deliveryPrices: settingsData.data.deliveryPrices,
            courierFees: settingsData.data.courierFees,
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchOffices();
  }, []);

  // Get regions list from locations data (Russian keys)
  const regionKeys = Object.keys(LOCATIONS);

  // Use translated regions from locale file for labels
  const uzbekistanRegions = t.regions as string[];

  // Get available districts for selected region
  const availableDistricts = region
    ? LOCATIONS[region as keyof typeof LOCATIONS] || []
    : [];

  // Filter BTS branches based on selected region and village (district)
  const branches = region
    ? allOffices
        .filter(
          (office) =>
            office.region === region && (!village || office.district === village)
        )
        .map((office, idx) => ({
          id: office._id,
          name: office.name,
          address: office.address,
        }))
    : [];

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.product.weight || 0.5) * item.quantity,
    0,
  );
  const { data: activePromotions = [] } = usePromotions();

  // Nudge Detection Effect
  useEffect(() => {
    if (
      !region ||
      !activePromotions.length ||
      hasShownNudgeForRegion === region
    )
      return;

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const nearMiss = activePromotions.find((promo) => {
      // Must be free delivery
      if (promo.discountType !== "free_delivery") return false;

      // Must be eligible for region
      const isRegionEligible =
        !promo.selectedRegions ||
        promo.selectedRegions.length === 0 ||
        promo.selectedRegions.includes(region);
      if (!isRegionEligible) return false;

      // Only nudge for item-count based promotions
      if (promo.conditionType !== "min_items") return false;

      const target = parseInt(promo.conditionValue) || 0;

      // We nudge if user has at least 2 items but hasn't reached the target yet
      // If they have equal to or more than target, they already have free delivery!
      return target > 1 && itemCount >= 2 && itemCount < target;
    });

    if (nearMiss) {
      setNearMissPromo(nearMiss);
      setShowNudge(true);
      setHasShownNudgeForRegion(region);
    }
  }, [region, activePromotions, items, hasShownNudgeForRegion]);

  let currentDeliveryPrice = calculateBTSDelivery(
    region,
    village,
    totalWeight,
    deliveryMethod,
    deliverySettings?.deliveryPrices,
    deliverySettings?.courierFees,
  );
  let productsDiscount = 0;

  // Apply Promotions
  activePromotions.forEach((promo) => {
    // Check if current region is eligible for this promo (if regions are specified)
    const isRegionEligible =
      !promo.selectedRegions ||
      promo.selectedRegions.length === 0 ||
      promo.selectedRegions.includes(region);

    if (promo.type === "global") {
      const conditionMet =
        (promo.conditionType === "min_items" &&
          items.reduce((sum, item) => sum + item.quantity, 0) >=
            promo.conditionValue) ||
        (promo.conditionType === "min_amount" &&
          totalAmount >= promo.conditionValue);

      if (conditionMet) {
        if (promo.discountType === "free_delivery" && isRegionEligible) {
          currentDeliveryPrice = 0;
        } else if (promo.discountType === "percentage") {
          productsDiscount += totalAmount * (promo.discountValue / 100);
        } else if (promo.discountType === "fixed") {
          productsDiscount += promo.discountValue;
        }
      }
    } else if (
      promo.type === "targeted" &&
      promo.conditionType === "product_selected"
    ) {
      // Find items in cart that match the targeted product list
      const targetedProducts = Array.isArray(promo.conditionValue)
        ? promo.conditionValue
        : [];
      let hasTargetedProduct = false;

      items.forEach((item) => {
        const productId = (
          item.product._id ||
          item.product.id ||
          ""
        ).toString();
        if (targetedProducts.includes(productId)) {
          hasTargetedProduct = true;
          if (promo.discountType === "percentage") {
            productsDiscount +=
              item.price * item.quantity * (promo.discountValue / 100);
          } else if (promo.discountType === "fixed") {
            productsDiscount += promo.discountValue * item.quantity;
          }
        }
      });

      // Targeted free delivery also respects region
      if (
        hasTargetedProduct &&
        promo.discountType === "free_delivery" &&
        isRegionEligible
      ) {
        currentDeliveryPrice = 0;
      }
    }
  });

  const finalTotal =
    Math.max(0, totalAmount - productsDiscount) + currentDeliveryPrice;
  const totalDiscount = productsDiscount;

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
        deliveryPrice: currentDeliveryPrice,
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
        <div className="p-2.5 relative">
          {showNudge && nearMissPromo && (
            <PromotionNudge
              promotion={nearMissPromo}
              currentCount={items.reduce((sum, item) => sum + item.quantity, 0)}
              region={region}
              onContinue={() => setShowNudge(false)}
              onShopMore={onClose}
            />
          )}
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-[22px]/[27px] text-[#333333] font-bold">
              {t.checkoutTitle}
            </h2>
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
                  className={`flex-1 h-[42px] px-3 rounded-xl border text-[13px]/[16px] transition-all flex items-center justify-center ${
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
                  className={`flex-1 h-[42px] px-3 rounded-xl border text-[13px]/[16px] transition-all flex items-center justify-center ${
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

            {/* Order Summary */}
            <div className="mt-4 mb-5 p-4">
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
                    {currentDeliveryPrice === 0 ? (
                      <span className="text-green-600 font-bold whitespace-nowrap">
                        Бесплатно
                      </span>
                    ) : (
                      `${currentDeliveryPrice.toLocaleString()} ${t.currency}`
                    )}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold mb-1">
                    <span>Скидка по акции:</span>
                    <span>
                      -{totalDiscount.toLocaleString()} {t.currency}
                    </span>
                  </div>
                )}
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex justify-between items-center text-[16px]/[20px] font-bold text-[#8814B1]">
                  <span>{t.total}:</span>
                  <span>
                    {finalTotal.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>
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
      <div className="bg-white rounded-[30px] w-full max-w-5xl max-h-[95vh] overflow-y-auto relative">
        {showNudge && nearMissPromo && (
          <PromotionNudge
            promotion={nearMissPromo}
            currentCount={items.reduce((sum, item) => sum + item.quantity, 0)}
            region={region}
            onContinue={() => setShowNudge(false)}
            onShopMore={onClose}
          />
        )}
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[22px]/[28px] text-[#333333] font-medium">
              {t.checkoutTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#8814B1] text-[24px]/[30px] cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full h-[42px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] text-sm ${
                    errors.customerName
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300"
                  }`}
                  placeholder={t.fullNamePlaceholder}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {errors.customerName}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phoneNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
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
                    className={`w-full h-[42px] pl-13 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] text-sm ${
                      errors.customerPhone
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder="XX XXX XX XX"
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {errors.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.deliveryMethod} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("door")}
                  className={`flex-1 h-[42px] px-4 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer flex items-center justify-center ${
                    deliveryMethod === "door"
                      ? "bg-[#00C6F1] text-white border-[#00C6F1] shadow-lg"
                      : "bg-white text-[#333333] border-gray-100 hover:border-[#00C6F1]"
                  }`}
                >
                  {t.toDoor}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex-1 h-[42px] px-4 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer flex items-center justify-center ${
                    deliveryMethod === "pickup"
                      ? "bg-[#00C6F1] text-white border-[#00C6F1] shadow-lg"
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
                  buttonClassName="h-[42px] px-3 py-2 text-sm"
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
                  buttonClassName="h-[42px] px-3 py-2 text-sm"
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
                    buttonClassName="h-[42px] px-3 py-2 text-sm"
                  />
                </div>
                {selectedBranch && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.streetAddress}
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 text-sm h-[42px] flex items-center">
                      {selectedBranch.address}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full h-[42px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] text-sm ${
                      errors.streetAddress
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.streetAddressPlaceholder}
                  />
                  {errors.streetAddress && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full h-[42px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] text-sm ${
                      errors.homeNumber
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300"
                    }`}
                    placeholder={t.homeNumberPlaceholder}
                  />
                  {errors.homeNumber && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.homeNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.telegramUsername}
                </label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] text-sm"
                  placeholder="@username"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] resize-none text-sm"
                  rows={1}
                  placeholder={t.notesPlaceholder}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-4 mb-3">
              <h3 className="text-[18px]/[22px] font-bold mb-2">
                {t.orderSummary}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]/[18px]">
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
                    {currentDeliveryPrice === 0 ? (
                      <span className="text-green-600 font-bold whitespace-nowrap">
                        Бесплатно
                      </span>
                    ) : (
                      `${currentDeliveryPrice.toLocaleString()} ${t.currency}`
                    )}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold mb-1">
                    <span>Скидка по акции:</span>
                    <span>
                      -{totalDiscount.toLocaleString()} {t.currency}
                    </span>
                  </div>
                )}
                <div className="col-span-2 h-px bg-gray-100 my-1" />
                <div className="col-span-2 flex justify-between items-center text-[20px]/[26px] font-bold text-[#00C6F1]">
                  <span>{t.total}:</span>
                  <span>
                    {finalTotal.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[42px] px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer text-sm"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 h-[42px] px-4 py-2 bg-[#00C6F1] text-white rounded-lg hover:bg-[#00C6F1]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
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
