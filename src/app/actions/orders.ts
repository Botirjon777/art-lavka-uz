"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  totalAmount: number;
  notes?: string;
}) {
  try {
    await dbConnect();

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      ...orderData,
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
    });

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
