"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

export async function trackOrder(orderNumber: string, phone: string) {
  try {
    await dbConnect();

    // Normalize the lookup phone number
    const normalizedPhone = normalizePhoneNumber(phone);

    // Find order by order number and customer phone
    // We search for exact match on normalized phone, 
    // but also fallback to a regex match for digits to support legacy data
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      $or: [
        { customerPhone: normalizedPhone },
        { customerPhone: { $regex: phone.replace(/\D/g, "") } }
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

    // Find all orders for the given phone number
    const orders = await Order.find({
      $or: [
        { customerPhone: normalizedPhone },
        { customerPhone: { $regex: digitsOnly } }
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
