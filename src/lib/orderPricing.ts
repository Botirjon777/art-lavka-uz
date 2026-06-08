// Server-side order pricing & validation.
//
// NOT a "use server" module — these helpers are called from within the
// createOrder server action only. Their job is to recompute money fields from
// authoritative database values so the client can never dictate prices.
import Product from "@/models/Product";
import Promotion from "@/models/Promotion";
import Settings from "@/models/Settings";
import { calculateBTSDelivery } from "@/lib/deliveryDataBTS";
import { evaluatePromotions } from "@/lib/promotions";

// Sanity cap for delivery price (client-supplied). Delivery being too LOW is
// the only money-saving vector, and free-delivery promos are accounted for
// below; this just rejects absurd values.
const MAX_DELIVERY_PRICE = 1_000_000;

interface OrderItem {
  product: { _id: string;[key: string]: any };
  color: string;
  size: string;
  quantity: number;
  price: number;
  [key: string]: any;
}

/**
 * Authoritative unit price for a given product/color/size, mirroring the
 * client's selection logic (variant price, falling back to product price).
 */
function authoritativeUnitPrice(
  product: any,
  color: string,
  size: string
): number {
  const colorData = product.colors?.find((c: any) => c.name === color);
  const variant = colorData?.variants?.find((v: any) => v.size === size);
  if (variant && Number(variant.price) > 0) {
    return Number(variant.price);
  }
  return Number(product.promoPrice) || Number(product.price) || 0;
}

export interface PricedOrder {
  valid: boolean;
  error?: string;
  /** Items with server-authoritative unit prices. */
  items: OrderItem[];
  /** Sum of authoritative line prices (before discounts / delivery). */
  subtotal: number;
  /** Clamped, server-trusted delivery price. */
  deliveryPrice: number;
  /** Server-trusted total to persist. */
  totalAmount: number;
}

/**
 * Recompute and validate an order's money fields against the database.
 *
 * - Overwrites every line item's `price` with the authoritative variant price.
 * - Computes the maximum legitimately-possible discount from active promotions
 *   (an upper bound — region/method constraints are treated permissively so we
 *   never reject a legitimate order).
 * - Rejects if the client-submitted total is below the minimum the server can
 *   justify, which blocks arbitrary "set my own price" manipulation.
 */
export async function priceAndValidateOrder(params: {
  items: OrderItem[];
  clientTotalAmount: number;
  clientDeliveryPrice: number;
  region: string;
  village: string;
  deliveryMethod: "door" | "pickup";
}): Promise<PricedOrder> {
  const { items, clientTotalAmount, region, village, deliveryMethod } = params;

  const ids = items.map((i) => i.product?._id).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const productById = new Map(
    (products as any[]).map((p) => [String(p._id), p])
  );

  let subtotal = 0;
  const pricedItems = items.map((item) => {
    const product = productById.get(String(item.product?._id));
    const unitPrice = product
      ? authoritativeUnitPrice(product, item.color, item.size)
      : 0;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    subtotal += unitPrice * quantity;
    return { ...item, quantity, price: unitPrice };
  });

  // Evaluate active promotions with the SAME logic the client uses for display
  // (shared module — region/method/Fergana gating included), so the server
  // floor matches what an honest client computes.
  const now = new Date();
  const activePromos = (await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean()) as any[];

  const totalQuantity = pricedItems.reduce((s, i) => s + i.quantity, 0);

  const { productsDiscount, freeDelivery } = evaluatePromotions({
    items: pricedItems.map((i) => ({
      productId: String(i.product?._id),
      price: i.price,
      quantity: i.quantity,
    })),
    subtotal,
    totalQuantity,
    region,
    village,
    deliveryMethod,
    promotions: activePromos,
  });

  // Compute weight from products for server-side delivery calculation
  const totalWeight = pricedItems.reduce((sum, item) => {
    const product = productById.get(String(item.product?._id));
    const weightKg = (product as any)?.weight ?? 0.5;
    return sum + weightKg * item.quantity;
  }, 0);

  // Fetch delivery settings from DB and recompute delivery price server-side
  const dbSettings = await Settings.findOne(
    {},
    { deliveryPrices: 1, courierFees: 1, ferganaFreeDelivery: 1, regionZones: 1 }
  ).lean();
  const computedDeliveryPrice = calculateBTSDelivery(
    region,
    village,
    totalWeight,
    deliveryMethod,
    (dbSettings as any)?.deliveryPrices,
    (dbSettings as any)?.courierFees,
    (dbSettings as any)?.ferganaFreeDelivery ?? true,
    (dbSettings as any)?.regionZones
  );

  const deliveryPrice = freeDelivery ? 0 : computedDeliveryPrice;

  // Minimum total the server is willing to accept.
  const minTotal =
    Math.max(0, subtotal - productsDiscount) +
    (freeDelivery ? 0 : deliveryPrice);

  const clientTotal = Number(clientTotalAmount) || 0;

  // Allow 1 unit of rounding slack.
  if (clientTotal + 1 < minTotal) {
    return {
      valid: false,
      error: "Price validation failed",
      items: pricedItems,
      subtotal,
      deliveryPrice,
      totalAmount: minTotal,
    };
  }

  return {
    valid: true,
    items: pricedItems,
    subtotal,
    deliveryPrice,
    // Persist the validated client total (it is >= the server minimum).
    totalAmount: clientTotal,
  };
}
