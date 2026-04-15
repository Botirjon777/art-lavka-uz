"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { validateStock, decrementStock } from "./validateStock";

// Generate unique order number
function generateOrderNumber(): string {
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `ORD-${random}`;
}

export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  region: string;
  village: string;
  customerAddress: string;
  items: any[];
  totalAmount: number;
  notes?: string;
}) {
  try {
    await dbConnect();

    // Step 1: Validate stock availability for all items
    const itemsToValidate = orderData.items.map((item) => ({
      productId: item.product._id,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
    }));

    const validation = await validateStock(itemsToValidate);

    if (!validation.success) {
      return {
        success: false,
        error: "Some items are out of stock",
        errors: validation.errors,
      };
    }

    // Step 2: Create the order
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      ...orderData,
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
    });

    // Step 3: Decrement stock for all items
    const stockUpdate = await decrementStock(itemsToValidate);

    if (!stockUpdate.success) {
      // If stock update fails, we should ideally rollback the order
      // For now, log the error
      console.error("Failed to update stock after order creation");
    }

    // Step 4: Send Telegram notification to admins
    try {
      const { sendOrderNotification } = await import("@/lib/telegram");
      await sendOrderNotification(order);
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
      // Don't fail the order creation if notification fails
    }

    revalidatePath("/admin/orders");
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrders() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrderById(id: string) {
  try {
    await dbConnect();
    const order = await Order.findById(id).lean();
    if (!order) {
      return null;
    }
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string
) {
  try {
    await dbConnect();

    const updateData: any = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }
}
