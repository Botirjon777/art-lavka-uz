"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

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

    // Normalize the lookup phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    const digitsOnly = phone.replace(/\D/g, "");

    // Build a flexible regex that allows optional non-digits between each digit
    let localDigits = digitsOnly;
    if (localDigits.startsWith("998") && localDigits.length === 12) {
      localDigits = localDigits.substring(3);
    }
    const pattern = localDigits.split("").join("\\D*");
    const flexibleRegex = new RegExp(pattern);

    // Find order by order number and customer phone
    // We search for exact match on normalized phone, 
    // fallback to digits-only regex, and fallback to flexible regex
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      $or: [
        { customerPhone: normalizedPhone },
        { customerPhone: { $regex: digitsOnly } },
        { customerPhone: { $regex: flexibleRegex } }
      ]
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

    // Normalize the lookup phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    const digitsOnly = phone.replace(/\D/g, "");

    // Build a flexible regex that allows optional non-digits between each digit
    let localDigits = digitsOnly;
    if (localDigits.startsWith("998") && localDigits.length === 12) {
      localDigits = localDigits.substring(3);
    }
    const pattern = localDigits.split("").join("\\D*");
    const flexibleRegex = new RegExp(pattern);

    // Find all orders for the given phone number, excluding support requests
    const orders = await Order.find({
      orderNumber: { $not: /^SUP-/ },
      $or: [
        { customerPhone: normalizedPhone },
        { customerPhone: { $regex: digitsOnly } },
        { customerPhone: { $regex: flexibleRegex } }
      ]
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

export async function getOrderByOrderNumber(orderNumber: string) {
  try {
    await dbConnect();

    // Block support inquiries
    if (orderNumber.toUpperCase().startsWith("SUP-")) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase()
    }).lean();

    if (!order) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Error fetching order by number:", error);
    return {
      success: false,
      error: "An error occurred while fetching the order.",
    };
  }
}
