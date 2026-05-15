"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { revalidatePath } from "next/cache";

function generateSupportNumber(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SUP-${random}`;
}

export async function createSupportRequest(formData: {
  fullName: string;
  phone: string;
  message: string;
}) {
  try {
    await dbConnect();

    const supportNumber = generateSupportNumber();

    // Create a dummy order record for support
    const supportOrder = await Order.create({
      orderNumber: supportNumber,
      customerName: `[SUPPORT] ${formData.fullName}`,
      customerPhone: formData.phone,
      region: "Support",
      village: "Request",
      deliveryMethod: "door",
      customerAddress: "Support Page Form",
      items: [
        {
          product: {
            _id: "support-req",
            name: "Support Help Request",
            image: "/art-lavka.png",
          },
          color: "N/A",
          size: "N/A",
          quantity: 1,
          price: 0,
        },
      ],
      totalAmount: 0,
      notes: formData.message,
      status: "pending",
      paymentStatus: "pending",
    });

    // Send Telegram notification if possible
    try {
      const { sendSupportNotification } = await import("@/lib/telegram");
      await sendSupportNotification(supportOrder);
    } catch (e) {
      console.error("Failed to send support notification to Telegram:", e);
    }

    revalidatePath("/admin/orders");
    return { success: true, orderNumber: supportNumber };
  } catch (error: any) {
    console.error("Error creating support request:", error);
    return { success: false, error: error.message };
  }
}
