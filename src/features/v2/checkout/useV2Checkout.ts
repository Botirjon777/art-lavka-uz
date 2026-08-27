"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CartItem } from "@/types";
import { createOrder } from "@/features/admin/orders/actions/orders";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { LOCATIONS, LocationTranslation } from "@/lib/i18n/locations";
import { calculateBTSDelivery } from "@/lib/deliveryDataBTS";
import { evaluatePromotions } from "@/lib/promotions";
import { useOffices } from "@/features/client/home/hooks/useOffices";
import { useSettings } from "@/features/client/home/hooks/useSettings";
import { usePromotions } from "@/features/client/home/hooks/usePromotions";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

export type Carrier = "bts" | "btsFergana";
export type DeliveryMethod = "door" | "pickup";
export type PaymentMethod = "cash" | "payme" | "qr";
export type Step = 1 | 2 | 3;

/** The extra fields `createOrder` can return beyond its declared shape. */
type OrderResultExtras = {
  paymeUrl?: string;
  errors?: string[];
};

/** Only the settings fields this hook actually reads. */
type DeliverySettings = {
  ferganaFreeDelivery?: boolean;
};

/**
 * All of v2's checkout wiring.
 *
 * Deliberately no new pricing maths: delivery comes from `calculateBTSDelivery`
 * and discounts from `evaluatePromotions` — the same functions v1 calls — and
 * the order itself goes through `createOrder`, which recomputes every money
 * field server-side and rejects anything that disagrees. What lives here is
 * only form state and the shape of the payload.
 */
export function useV2Checkout(items: CartItem[], onPlaced: (orderNumber: string) => void) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();

  const { data: settings } = useSettings();
  const { data: allOffices = [] } = useOffices();
  const { data: activePromotions = [] } = usePromotions();

  const [step, setStep] = useState<Step>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [carrier, setCarrier] = useState<Carrier>("bts");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("door");
  const [region, setRegion] = useState("");
  const [village, setVillage] = useState("");
  const [branchId, setBranchId] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [ferganaAddress, setFerganaAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const isFergana = carrier === "btsFergana";

  // ---- location options -------------------------------------------------
  const regionKeys = useMemo(() => Object.keys(LOCATIONS), []);
  const regionLabels = (t.regions as string[]) || regionKeys;

  const regionOptions = useMemo(
    () => regionKeys.map((key, i) => ({ value: key, label: regionLabels[i] ?? key })),
    [regionKeys, regionLabels]
  );

  const districtOptions = useMemo(() => {
    if (!region) return [];
    return (LOCATIONS[region as keyof typeof LOCATIONS] || [])
      // Fergana city has its own carrier shortcut, so it is not offered here.
      .filter((d) => !(carrier === "bts" && region === "Ферганская область" && d.ru === "г.Фергана"))
      .map((d) => ({
        value: d.ru,
        label: d[lang as keyof LocationTranslation] || d.ru,
      }));
  }, [region, carrier, lang]);

  const branches = useMemo(() => {
    if (!region) return [];
    return allOffices
      .filter((o) => o.region === region && (!village || o.district === village))
      .map((o) => ({ id: o._id, name: o.name, address: o.address }));
  }, [allOffices, region, village]);

  const selectedBranch = branches.find((b) => b.id === branchId);

  // ---- money ------------------------------------------------------------
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalWeight = items.reduce(
    (sum, i) => sum + (i.product.weight || 0.5) * i.quantity,
    0
  );

  const effectiveRegion = isFergana ? "Ферганская область" : region;
  const effectiveVillage = isFergana ? "г.Фергана" : village;
  const effectiveMethod: DeliveryMethod = isFergana ? "door" : deliveryMethod;
  const ferganaFreeDelivery =
    (settings as DeliverySettings | undefined)?.ferganaFreeDelivery ?? true;

  const baseDeliveryPrice = calculateBTSDelivery(
    effectiveRegion,
    effectiveVillage,
    totalWeight,
    effectiveMethod,
    settings?.deliveryPrices,
    settings?.courierFees,
    ferganaFreeDelivery
  );

  const { productsDiscount, freeDelivery } = evaluatePromotions({
    items: items.map((i) => ({
      productId: (i.product._id || i.product.id || "").toString(),
      price: i.price,
      quantity: i.quantity,
    })),
    subtotal,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    region: effectiveRegion,
    village: effectiveVillage,
    deliveryMethod: effectiveMethod,
    promotions: activePromotions,
  });

  const currentDeliveryPrice = freeDelivery ? 0 : baseDeliveryPrice;

  // Delivery can only be priced once the address it depends on is chosen.
  const deliveryReady = isFergana || (carrier === "bts" && !!region && !!village);

  const finalTotal =
    Math.max(0, subtotal - productsDiscount) + (deliveryReady ? currentDeliveryPrice : 0);

  // ---- validation -------------------------------------------------------
  const validateStep = (target: Step): boolean => {
    const e: Record<string, string> = {};

    if (target >= 1) {
      if (!customerName.trim()) e.customerName = t.errorNameRequired;
      else if (customerName.trim().length < 3) e.customerName = t.errorNameShort;

      const digits = customerPhone.replace(/\D/g, "");
      if (!digits) e.customerPhone = t.errorPhoneRequired;
      else if (digits.length < 9) e.customerPhone = t.errorPhoneInvalid;
    }

    if (target >= 2) {
      if (!carrier) e.carrier = t.errorCarrierRequired || "Выберите способ доставки";
      if (isFergana) {
        if (!ferganaAddress.trim()) e.ferganaAddress = t.errorFerganaAddressRequired;
      } else {
        if (!region) e.region = t.errorRegionRequired;
        if (!village) e.village = t.villagePlaceholder;
        if (deliveryMethod === "door" && !streetAddress.trim()) {
          e.streetAddress = t.errorStreetRequired;
        }
        if (deliveryMethod === "pickup" && !branchId) e.branch = t.selectBranch;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (target: Step) => {
    // Moving backwards is always allowed; moving forward validates everything
    // up to the step being left behind.
    if (target <= step) {
      setStep(target);
      return;
    }
    for (let s = step; s < target; s++) {
      if (!validateStep(s as Step)) {
        toast.error(t.errorFormFix);
        setStep(s as Step);
        return;
      }
    }
    setStep(target);
  };

  const next = () => {
    if (step < 3) {
      goToStep((step + 1) as Step);
      return;
    }
    submit();
  };

  const submit = () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error(t.errorFormFix);
      return;
    }
    // A QR transfer is manual: show the code first and only create the order
    // once the customer confirms they have paid.
    if (paymentMethod === "qr") {
      setQrOpen(true);
      return;
    }
    placeOrder();
  };

  const placeOrder = async () => {
    if (!items.length) return;
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

      const result = await createOrder({
        customerName: customerName.trim(),
        customerPhone: normalizePhoneNumber(customerPhone),
        region: effectiveRegion,
        village: effectiveVillage,
        deliveryMethod: effectiveMethod,
        branch: isFergana ? undefined : selectedBranch?.name,
        deliveryPrice: currentDeliveryPrice,
        customerAddress: isFergana
          ? ferganaAddress.trim()
          : deliveryMethod === "door"
            ? streetAddress.trim()
            : selectedBranch?.address || "",
        items: orderItems,
        totalAmount: finalTotal,
        notes: notes.trim(),
        paymentMethod,
      });

      const extras = result as OrderResultExtras;

      if (result.success && result.order) {
        if (paymentMethod === "payme" && extras.paymeUrl) {
          window.open(extras.paymeUrl, "_blank", "noopener,noreferrer");
        }
        setQrOpen(false);
        toast.success(t.orderSuccess);
        onPlaced(result.order.orderNumber);
      } else {
        const stockErrors = extras.errors;
        if (stockErrors?.length) {
          stockErrors.forEach((msg) => toast.error(msg, { duration: 6000 }));
        } else {
          toast.error(result.error || "Не удалось оформить заказ");
        }
      }
    } catch (error) {
      console.error("v2 checkout: createOrder failed", error);
      toast.error("Произошла ошибка при оформлении заказа");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    t,
    step,
    goToStep,
    next,
    back: () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s)),

    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    notes, setNotes,

    carrier, setCarrier,
    deliveryMethod, setDeliveryMethod,
    region, setRegion,
    village, setVillage,
    branchId, setBranchId,
    streetAddress, setStreetAddress,
    ferganaAddress, setFerganaAddress,

    paymentMethod, setPaymentMethod,

    regionOptions,
    districtOptions,
    branches,
    selectedBranch,

    subtotal,
    productsDiscount,
    currentDeliveryPrice,
    deliveryReady,
    freeDelivery,
    finalTotal,

    errors,
    isSubmitting,
    qrOpen,
    setQrOpen,
    placeOrder,
    isFergana,
  };
}
