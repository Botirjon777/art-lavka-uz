"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

// Builds a tolerant customerPhone matcher: exact normalized match first, then
// digit-based fallbacks for legacy records stored in varied formats. The input
// is reduced to digits (no regex-injection surface) and length-capped to avoid
// pathological regex evaluation.
function buildPhoneMatch(phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const digitsOnly = phone.replace(/\D/g, "").slice(0, 15);

  let localDigits = digitsOnly;
  if (localDigits.startsWith("998") && localDigits.length === 12) {
    localDigits = localDigits.substring(3);
  }
  const flexibleRegex = new RegExp(localDigits.split("").join("\\D*"));

  return [
    { customerPhone: normalizedPhone },
    { customerPhone: { $regex: digitsOnly } },
    { customerPhone: { $regex: flexibleRegex } },
  ];
}

export async function trackOrder(orderNumber: string, phone: string) {
  try {
    await dbConnect();

    // Fast return if orderNumber is a support request
    if (orderNumber.toUpperCase().startsWith("SUP-")) {
      return {
        success: false,
        error: "Order not found. Please check your order number.",
      };
    }

    // Match on order number plus the customer's phone (exact + fallbacks).
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      $or: buildPhoneMatch(phone),
    }).lean();

    if (!order) {
      return {
        success: false,
        error:
          "Order not found. Please check your order number and phone number.",
      };
    }

    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Error tracking order:", error);
    return {
      success: false,
      error: "An error occurred while tracking your order.",
    };
  }
}

export async function getOrdersByPhone(phone: string) {
  try {
    await dbConnect();

    // Find all orders for the given phone number, excluding support requests
    const orders = await Order.find({
      orderNumber: { $not: /^SUP-/ },
      $or: buildPhoneMatch(phone),
    })
      .select("orderNumber status totalAmount createdAt customerName")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return {
        success: false,
        error: "No orders found for this phone number.",
      };
    }

    return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    console.error("Error fetching orders by phone:", error);
    return {
      success: false,
      error: "An error occurred while fetching your orders.",
    };
  }
}

// NOTE: there is intentionally no "look up an order by number alone" action.
// Returning order details (name, phone, address, items) from a guessable order
// number is an IDOR / PII leak. Order details require a matching phone number
// via trackOrder().
