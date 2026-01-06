"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function trackOrder(orderNumber: string, phone: string) {
  try {
    await dbConnect();

    // Find order by order number and customer phone
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      customerPhone: phone,
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
