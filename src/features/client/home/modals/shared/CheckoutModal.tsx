"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/types";
import { createOrder } from "@/features/admin/orders/actions/orders";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/Modal";
import MobileModal from "../mobile/MobileModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { normalizePhoneNumber, applyPhoneMask } from "@/lib/phoneUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { LOCATIONS } from "@/lib/i18n/locations";
import { DeliveryBranch } from "@/lib/deliveryData";
import { usePromotions } from "@/features/client/home/hooks/usePromotions";
import { calculateBTSDelivery as calculateBTSDeliveryV2 } from "@/lib/deliveryDataBTS";
import PromotionNudge from "../../components/PromotionNudge";
import { Promotion, Office } from "@/types";
import { useOffices } from "@/features/client/home/hooks/useOffices";
import { useSettings } from "@/features/client/home/hooks/useSettings";

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
  const [carrier, setCarrier] = useState<"bts" | "btsFergana" | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"door" | "pickup">(
    "pickup",
  );
  const [selectedBranch, setSelectedBranch] = useState<DeliveryBranch | null>(
    null,
  );

  // BTS Fergana specific state
  const [ferganaDistrict, setFerganaDistrict] = useState("г.Фергана");
  const [ferganaAddress, setFerganaAddress] = useState("");

  // Use hooks for data fetching
  const { data: offices = [] } = useOffices({ enabled: isOpen });
  const { data: settings } = useSettings({ enabled: isOpen });

  useEffect(() => {
    if (offices.length > 0) {
      setAllOffices(offices);
    }
  }, [offices]);

  useEffect(() => {
    if (settings) {
      setDeliverySettings({
        deliveryPrices: settings.deliveryPrices,
        courierFees: settings.courierFees,
      });
    }
  }, [settings]);

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
            office.region === region &&
            (!village || office.district === village),
        )
        .map((office) => ({
          id: office._id,
          name: office.name,
          address: office.address,
        }))
    : [];

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.product.weight || 0.5) * item.quantity,
    0,
  );
  const { data: activePromotions = [] } = usePromotions({ enabled: isOpen });

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
      if (promo.discountType !== "free_delivery") return false;
      const isRegionEligible =
        !promo.selectedRegions ||
        promo.selectedRegions.length === 0 ||
        promo.selectedRegions.includes(region);
      if (!isRegionEligible) return false;
      if (promo.conditionType !== "min_items") return false;
      const target = parseInt(promo.conditionValue) || 0;
      return target > 1 && itemCount >= 2 && itemCount < target;
    });

    if (nearMiss) {
      setNearMissPromo(nearMiss);
      setShowNudge(true);
      setHasShownNudgeForRegion(region);
    }
  }, [region, activePromotions, items, hasShownNudgeForRegion]);

  let currentDeliveryPrice =
    carrier === "btsFergana"
      ? 0
      : calculateBTSDeliveryV2(
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
          const isFerganaRegion = region && region.includes("Ферган");
          const isFerganaCity = village && (
            village.includes("г.Фергана") || 
            village.includes("г. Фергана") ||
            village.includes("Farg'ona sh") ||
            village.includes("Fergana city")
          );
          
          if (!isFerganaRegion || isFerganaCity) {
            currentDeliveryPrice = 0;
          }
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

      if (
        hasTargetedProduct &&
        promo.discountType === "free_delivery" &&
        isRegionEligible
      ) {
        const isFerganaRegion = region && region.includes("Ферган");
        const isFerganaCity = village && (
          village.includes("г.Фергана") || 
          village.includes("г. Фергана") ||
          village.includes("Farg'ona sh") ||
          village.includes("Fergana city")
        );
        
        if (!isFerganaRegion || isFerganaCity) {
          currentDeliveryPrice = 0;
        }
      }
    }
  });

  const finalTotal =
    Math.max(0, totalAmount - productsDiscount) + currentDeliveryPrice;
  const totalDiscount = productsDiscount;

  const isMobile = useIsMobile();

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

    if (!carrier) {
      newErrors.carrier =
        t.errorCarrierRequired || "Please select a delivery option";
    }

    if (carrier === "btsFergana") {
      if (!ferganaAddress.trim()) {
        newErrors.ferganaAddress = t.errorFerganaAddressRequired;
      }
    } else if (carrier === "bts") {
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
              frontImagePreview: item.print.frontImagePreview,
              backImage: item.print.backImage,
            }
          : null,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const isFergana = carrier === "btsFergana";
      const result = await createOrder({
        customerName,
        customerPhone: normalizePhoneNumber(customerPhone),
        region: isFergana ? "Ферганская область" : region,
        village: isFergana ? "г.Фергана" : village,
        deliveryMethod: isFergana ? "door" : deliveryMethod,
        branch: isFergana ? undefined : selectedBranch?.name,
        deliveryPrice: currentDeliveryPrice,
        customerAddress: isFergana
          ? ferganaAddress
          : deliveryMethod === "door"
            ? `${streetAddress}, ${homeNumber}`
            : selectedBranch?.address || "",
        items: orderItems,
        totalAmount: finalTotal,
        notes:
          notes || (telegramUsername ? `Telegram: ${telegramUsername}` : ""),
      });

      if (result.success && result.order) {
        toast.success(t.orderSuccess);
        onSuccess(result.order.orderNumber);
        onClose();
      } else {
        toast.error(result.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("An error occurred while placing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMobile) {
    return (
      <MobileModal
        isOpen={isOpen}
        onClose={onClose}
        title={t.checkoutTitle}
      >
        <div className="p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[13px]/[16px] text-[#333333] mb-1 font-medium">
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
                  className={`w-full px-2.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-[16px] transition-all ${
                    errors.customerName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={t.fullNamePlaceholder}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-[13px]/[16px] text-[#333333] mb-1 font-medium">
                  {t.phoneNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]/[17px]">
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
                    className={`w-full pl-13 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] text-base transition-all ${
                      errors.customerPhone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="XX XXX XX XX"
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px]/[16px] text-[#333333] font-medium">
                {t.selectDeliveryOption}
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setCarrier("bts")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-[14px] font-bold ${
                    carrier === "bts"
                      ? "border-[#8814B1] bg-purple-50 text-[#8814B1]"
                      : "border-gray-200 text-gray-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={carrier === "bts"}
                    className="accent-[#8814B1] shrink-0"
                  />
                  <div className="flex flex-col">
                    <span>{t.btsUzbekistanCarrier}</span>
                    <span className="text-[11px] font-medium opacity-60">
                      {currentDeliveryPrice > 0 
                        ? `${currentDeliveryPrice.toLocaleString()} ${t.currency}` 
                        : "25 000+ " + t.currency}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCarrier("btsFergana")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-[14px] font-bold ${
                    carrier === "btsFergana"
                      ? "border-[#059669] bg-emerald-50 text-[#059669]"
                      : "border-gray-200 text-gray-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={carrier === "btsFergana"}
                    className="accent-[#059669] shrink-0"
                  />
                  <div className="flex flex-col">
                    <span>{t.btsFerganaCarrier}</span>
                    <span className="text-[11px] font-black text-[#059669] uppercase tracking-wider">
                      {t.free}
                    </span>
                  </div>
                </button>
              </div>
              {errors.carrier && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.carrier}
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {carrier === "btsFergana" && (
                <motion.div
                  key="fergana"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 px-1 -mx-1"
                >
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                    <span className="text-emerald-600 text-[11px]">✓</span>
                    <span className="text-emerald-700 text-[12px] font-medium">
                      {t.btsFerganaDesc}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#333333] mb-1 font-medium">
                      {t.ferganaDistrict}
                    </label>
                    <input
                      type="text"
                      value="г.Фергана"
                      disabled
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#333333] mb-1 font-medium">
                      {t.ferganaAddress} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ferganaAddress}
                      onChange={(e) => {
                        setFerganaAddress(e.target.value);
                        if (errors.ferganaAddress) setErrors({ ...errors, ferganaAddress: "" });
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl border transition-all outline-none ${
                        errors.ferganaAddress ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-[#8814B1]"
                      }`}
                      placeholder={t.ferganaAddressPlaceholder}
                    />
                    {errors.ferganaAddress && (
                      <p className="text-red-500 text-[11px] mt-1">
                        {errors.ferganaAddress}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {carrier === "bts" && (
                <motion.div
                  key="bts"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 px-1 -mx-1"
                >
                  <Dropdown
                    label={t.deliveryMethod}
                    value={deliveryMethod}
                    placeholder={t.selectOption}
                    onChange={(val) =>
                      setDeliveryMethod(val as "door" | "pickup")
                    }
                    options={[
                      { value: "door", label: t.toDoor },
                      { value: "pickup", label: t.toPunct },
                    ]}
                    buttonClassName="px-3 py-2.5 text-base"
                  />
                  <Dropdown
                    label={t.region}
                    value={region}
                    placeholder={t.regionPlaceholder}
                    onChange={(val) => {
                      setRegion(val);
                      setVillage("");
                    }}
                    options={regionKeys.map((k, i) => ({
                      key: k,
                      value: k,
                      label: uzbekistanRegions[i],
                    }))}
                    buttonClassName="px-3 py-2.5 text-base"
                  />
                  <Dropdown
                    label={t.village}
                    value={village}
                    placeholder={t.villagePlaceholder}
                    disabled={!region}
                    onChange={setVillage}
                    options={availableDistricts.map((d) => ({
                      key: d.ru,
                      value: d.ru,
                      label: d[lang as keyof typeof d] || d.ru,
                    }))}
                    buttonClassName="px-3 py-2.5 text-base"
                  />
                  {deliveryMethod === "pickup" ? (
                    <>
                    <Dropdown
                      label={t.selectBranch}
                      value={selectedBranch?.id || ""}
                      placeholder={t.selectBranch}
                      disabled={!village}
                      onChange={(id) =>
                        setSelectedBranch(
                          branches.find((b) => b.id === id) || null,
                        )
                      }
                      options={branches.map((b) => ({
                        key: b.id,
                        value: b.id,
                        label: b.name,
                        description: b.address,
                      }))}
                      buttonClassName="px-3 py-2.5 text-base"
                    />
                    {selectedBranch && (
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl mt-2">
                        <p className="text-[9px] font-black text-[#8814B1] uppercase tracking-[0.2em] mb-1">
                          {t.deliveryAddress}
                        </p>
                        <p className="text-[#333333] font-bold text-[13px]">
                          {selectedBranch.address}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-base"
                        placeholder={t.streetAddressPlaceholder}
                      />
                      <input
                        type="text"
                        value={homeNumber}
                        onChange={(e) => setHomeNumber(e.target.value)}
                        className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-base"
                        placeholder={t.homeNumberPlaceholder}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gray-50 rounded-xl p-4 mt-2 space-y-2">
              <div className="flex justify-between items-center text-[13px] text-gray-500">
                <span>{t.items}:</span>
                <span>{(totalAmount - productsDiscount).toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-gray-500">
                <span>{t.delivery}:</span>
                <span className={currentDeliveryPrice === 0 ? "text-[#059669] font-bold" : ""}>
                  {currentDeliveryPrice === 0 ? t.free : `${currentDeliveryPrice.toLocaleString()} ${t.currency}`}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-[16px] font-bold text-[#8814B1]">
                <span>{t.total}:</span>
                <span>
                  {finalTotal.toLocaleString()} {t.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-[14px]"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#8814B1] text-white rounded-lg font-medium shadow-lg text-[14px]"
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

  // Desktop
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showBackgroundImage={false}>
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6">{t.checkoutTitle}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors({ ...errors, customerName: "" });
                }}
                className={`w-full h-11 px-4 border rounded-xl outline-none transition-all ${
                  errors.customerName ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"
                }`}
                placeholder={t.fullNamePlaceholder}
              />
              {errors.customerName && (
                <p className="text-red-500 text-[12px] mt-1">{errors.customerName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.phoneNumber} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  +998
                </span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(applyPhoneMask(e.target.value));
                    if (errors.customerPhone) setErrors({ ...errors, customerPhone: "" });
                  }}
                  className={`w-full h-11 pl-14 pr-4 border rounded-xl outline-none transition-all ${
                    errors.customerPhone ? "border-red-500 bg-red-50" : "border-gray-300 focus:ring-2 focus:ring-purple-500"
                  }`}
                  placeholder="XX XXX XX XX"
                />
              </div>
              {errors.customerPhone && (
                <p className="text-red-500 text-[12px] mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {t.selectDeliveryOption}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCarrier("bts")}
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-bold ${
                  carrier === "bts"
                    ? "border-[#8814B1] bg-purple-50 text-[#8814B1]"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                <input
                  type="radio"
                  readOnly
                  checked={carrier === "bts"}
                  className="accent-[#8814B1]"
                />
                <div className="flex flex-col text-left">
                  <span>{t.btsUzbekistanCarrier}</span>
                  <span className="text-[12px] font-medium opacity-70">
                    {currentDeliveryPrice > 0 
                      ? `${currentDeliveryPrice.toLocaleString()} ${t.currency}` 
                      : "25 000+ " + t.currency}
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setCarrier("btsFergana")}
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-bold ${
                  carrier === "btsFergana"
                    ? "border-[#059669] bg-emerald-50 text-[#059669]"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                <input
                  type="radio"
                  readOnly
                  checked={carrier === "btsFergana"}
                  className="accent-[#059669]"
                />
                <div className="flex flex-col text-left">
                  <span>{t.btsFerganaCarrier}</span>
                  <span className="text-[12px] font-black text-[#059669] uppercase tracking-widest">
                    {t.free}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {carrier && (
              <motion.div
                key={carrier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {carrier === "btsFergana" ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.ferganaDistrict}
                      </label>
                      <input
                        type="text"
                        value="г.Фергана"
                        disabled
                        className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.ferganaAddress} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ferganaAddress}
                        onChange={(e) => {
                          setFerganaAddress(e.target.value);
                          if (errors.ferganaAddress) setErrors({ ...errors, ferganaAddress: "" });
                        }}
                        className={`w-full h-11 px-4 border rounded-xl outline-none transition-all ${
                          errors.ferganaAddress ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-[#8814B1]"
                        }`}
                        placeholder={t.ferganaAddressPlaceholder}
                      />
                      {errors.ferganaAddress && (
                        <p className="text-red-500 text-[12px] mt-1">
                          {errors.ferganaAddress}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Dropdown
                      label={t.deliveryMethod}
                      value={deliveryMethod}
                      placeholder={t.selectOption}
                      onChange={(v) => setDeliveryMethod(v as any)}
                      options={[
                        { value: "door", label: t.toDoor },
                        { value: "pickup", label: t.toPunct },
                      ]}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <Dropdown
                        label={t.region}
                        value={region}
                        required
                        error={errors.region}
                        placeholder={t.regionPlaceholder}
                        onChange={(v) => {
                          setRegion(v);
                          setVillage("");
                          if (errors.region) setErrors({ ...errors, region: "" });
                        }}
                        options={regionKeys.map((k, i) => ({
                          key: k,
                          value: k,
                          label: uzbekistanRegions[i],
                        }))}
                      />
                      <Dropdown
                        label={t.village}
                        value={village}
                        required
                        error={errors.village}
                        placeholder={t.villagePlaceholder}
                        disabled={!region}
                        onChange={(v) => {
                          setVillage(v);
                          if (errors.village) setErrors({ ...errors, village: "" });
                        }}
                        options={availableDistricts.map((d) => ({
                          key: d.ru,
                          value: d.ru,
                          label: d[lang as keyof typeof d] || d.ru,
                        }))}
                      />
                    </div>
                    {deliveryMethod === "pickup" ? (
                      <>
                        <Dropdown
                          label={t.selectBranch}
                          value={selectedBranch?.id || ""}
                          required
                          error={errors.branch}
                          placeholder={t.selectBranch}
                          disabled={!village}
                          onChange={(id) => {
                            setSelectedBranch(
                              branches.find((b) => b.id === id) || null,
                            );
                            if (errors.branch) setErrors({ ...errors, branch: "" });
                          }}
                          options={branches.map((b) => ({
                            key: b.id,
                            value: b.id,
                            label: b.name,
                            description: b.address,
                          }))}
                        />
                      {selectedBranch && (
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] font-black text-[#8814B1] uppercase tracking-[0.2em] mb-1">
                            {t.deliveryAddress}
                          </p>
                          <p className="text-[#333333] font-bold text-[14px]">
                            {selectedBranch.address}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.streetAddress} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => {
                              setStreetAddress(e.target.value);
                              if (errors.streetAddress) setErrors({ ...errors, streetAddress: "" });
                            }}
                            className={`w-full h-11 px-4 border rounded-xl outline-none transition-all ${
                              errors.streetAddress ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-[#8814B1]"
                            }`}
                            placeholder={t.streetAddressPlaceholder}
                          />
                          {errors.streetAddress && (
                            <p className="text-red-500 text-[12px] mt-1">{errors.streetAddress}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.homeNumber} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={homeNumber}
                            onChange={(e) => {
                              setHomeNumber(e.target.value);
                              if (errors.homeNumber) setErrors({ ...errors, homeNumber: "" });
                            }}
                            className={`w-full h-11 px-4 border rounded-xl outline-none transition-all ${
                              errors.homeNumber ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-[#8814B1]"
                            }`}
                            placeholder={t.homeNumberPlaceholder}
                          />
                          {errors.homeNumber && (
                            <p className="text-red-500 text-[12px] mt-1">{errors.homeNumber}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>{t.items}:</span>
              <span className="font-medium">{(totalAmount - productsDiscount).toLocaleString()} {t.currency}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>{t.delivery}:</span>
              <span className={`font-medium ${currentDeliveryPrice === 0 ? "text-[#059669]" : ""}`}>
                {currentDeliveryPrice === 0 ? t.free : `${currentDeliveryPrice.toLocaleString()} ${t.currency}`}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xl font-bold text-[#8814B1]">
              <span>{t.total}:</span>
              <span>
                {finalTotal.toLocaleString()} {t.currency}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 h-14 bg-[#8814B1] text-white rounded-xl font-bold shadow-lg shadow-purple-100 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
