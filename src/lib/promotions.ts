// Single source of truth for promotion evaluation.
//
// Used by BOTH the client (CheckoutModal, for live display) and the server
// (orderPricing, for authoritative validation) so the two can never drift.
// Pure & dependency-free — give it normalized inputs, get discounts back.

export interface PromoEvalItem {
  productId: string;
  /** Authoritative unit price. */
  price: number;
  quantity: number;
}

export interface PromoEvalPromotion {
  type: "global" | "targeted";
  conditionType: "min_items" | "min_amount" | "product_selected";
  conditionValue: unknown; // number | string | string[]
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  selectedRegions?: string[];
  selectedDeliveryMethods?: Array<"door" | "pickup">;
}

export interface PromoEvalParams {
  items: PromoEvalItem[];
  /** Sum of price*quantity across items, before any discount. */
  subtotal: number;
  totalQuantity: number;
  region: string;
  village: string;
  deliveryMethod: "door" | "pickup";
  promotions: PromoEvalPromotion[];
}

export interface PromoEvalResult {
  /** Total discount applied to products (never exceeds subtotal). */
  productsDiscount: number;
  /** Whether delivery should be free. */
  freeDelivery: boolean;
}

/** Empty / missing region list means "all regions". */
function regionEligible(selectedRegions: string[] | undefined, region: string): boolean {
  return (
    !selectedRegions ||
    selectedRegions.length === 0 ||
    selectedRegions.includes(region)
  );
}

/** Empty / missing method list means "all methods". */
function deliveryMethodEligible(
  methods: Array<"door" | "pickup"> | undefined,
  method: "door" | "pickup",
): boolean {
  return !methods || methods.length === 0 || methods.includes(method);
}

function freeDeliveryAllowed(
  promo: PromoEvalPromotion,
  region: string,
  deliveryMethod: "door" | "pickup",
): boolean {
  return (
    regionEligible(promo.selectedRegions, region) &&
    deliveryMethodEligible(promo.selectedDeliveryMethods, deliveryMethod)
  );
}

/**
 * Evaluate all active promotions against an order. Discounts from multiple
 * promotions stack. The result is identical whether run on the client (for
 * display) or the server (for validation), given the same inputs.
 */
export function evaluatePromotions(params: PromoEvalParams): PromoEvalResult {
  const {
    items,
    subtotal,
    totalQuantity,
    region,
    deliveryMethod,
    promotions,
  } = params;

  let productsDiscount = 0;
  let freeDelivery = false;

  for (const promo of promotions) {
    if (promo.type === "global") {
      const conditionMet =
        (promo.conditionType === "min_items" &&
          totalQuantity >= Number(promo.conditionValue)) ||
        (promo.conditionType === "min_amount" &&
          subtotal >= Number(promo.conditionValue));
      if (!conditionMet) continue;

      if (promo.discountType === "free_delivery") {
        if (freeDeliveryAllowed(promo, region, deliveryMethod)) {
          freeDelivery = true;
        }
      } else if (promo.discountType === "percentage") {
        productsDiscount += subtotal * (Number(promo.discountValue) / 100);
      } else if (promo.discountType === "fixed") {
        productsDiscount += Number(promo.discountValue);
      }
    } else if (
      promo.type === "targeted" &&
      promo.conditionType === "product_selected"
    ) {
      const targets: string[] = Array.isArray(promo.conditionValue)
        ? promo.conditionValue.map(String)
        : [];
      let hasTarget = false;

      for (const item of items) {
        if (!targets.includes(String(item.productId))) continue;
        hasTarget = true;
        if (promo.discountType === "percentage") {
          productsDiscount +=
            item.price * item.quantity * (Number(promo.discountValue) / 100);
        } else if (promo.discountType === "fixed") {
          productsDiscount += Number(promo.discountValue) * item.quantity;
        }
      }

      if (
        hasTarget &&
        promo.discountType === "free_delivery" &&
        freeDeliveryAllowed(promo, region, deliveryMethod)
      ) {
        freeDelivery = true;
      }
    }
  }

  productsDiscount = Math.min(Math.max(0, productsDiscount), subtotal);
  return { productsDiscount, freeDelivery };
}
