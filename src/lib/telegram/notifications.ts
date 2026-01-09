import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import TelegramSession from "@/models/TelegramSession";

export async function sendOrderNotification(order: any) {
  try {
    await dbConnect();

    // Get all authenticated admin sessions
    const sessions = await TelegramSession.find({ isAuthenticated: true });

    if (sessions.length === 0) {
      console.log("No authenticated Telegram sessions found");
      return;
    }

    // Lazy import bot to avoid circular dependencies
    const { default: bot } = await import("./bot");

    // Format order notification message
    const message = formatOrderNotification(order);

    // Send notification to all authenticated admins
    for (const session of sessions) {
      try {
        await bot.sendMessage(session.chatId, message, {
          parse_mode: "Markdown",
        });
      } catch (error) {
        console.error(
          `Failed to send notification to chat ${session.chatId}:`,
          error
        );
      }
    }

    console.log(`Order notification sent to ${sessions.length} admin(s)`);
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
}

function formatOrderNotification(order: any): string {
  const statusEmoji = getStatusEmoji(order.status);
  const paymentEmoji = getPaymentEmoji(order.paymentStatus);

  let message = `🔔 *New Order Received!*\n\n`;
  message += `*Order #:* ${order.orderNumber}\n`;
  message += `*Status:* ${statusEmoji} ${order.status}\n`;
  message += `*Payment:* ${paymentEmoji} ${order.paymentStatus}\n\n`;

  message += `👤 *Customer:*\n`;
  message += `Name: ${order.customerName}\n`;
  message += `Phone: ${order.customerPhone}\n`;
  message += `Region: ${order.region}\n`;
  message += `Address: ${order.customerAddress}\n\n`;

  message += `🛍️ *Items:*\n`;
  order.items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Size: ${item.size} | Color: ${item.color}\n`;
    if (item.print) {
      message += `   Print: ${item.print.name}\n`;
    }
    message += `   Qty: ${item.quantity} × ${item.price.toLocaleString()} = ${(
      item.quantity * item.price
    ).toLocaleString()} UZS\n\n`;
  });

  message += `💰 *Total:* ${order.totalAmount.toLocaleString()} UZS\n`;

  if (order.notes) {
    message += `\n📝 *Notes:* ${order.notes}`;
  }

  return message;
}

function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    processing: "🔄",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  };
  return emojiMap[status] || "❓";
}

function getPaymentEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    pending: "⏳",
    paid: "✅",
    failed: "❌",
  };
  return emojiMap[status] || "❓";
}
