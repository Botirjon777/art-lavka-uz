import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * Translates English order statuses to Russian with emojis.
 */
function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "⏳ Ожидает подтверждения",
    confirmed: "✅ Подтвержден",
    processing: "🔄 В обработке",
    shipped: "📦 Отправлен",
    delivered: "🏠 Доставлен",
    cancelled: "❌ Отменен",
  };
  return statusMap[status] || status;
}

/**
 * Formats order details for the user.
 */
function formatOrderMessage(order: any): string {
  let message = `📦 *Заказ #${order.orderNumber}*\n\n`;
  message += `👤 *Клиент:* ${order.customerName}\n`;
  message += `📊 *Статус:* ${translateStatus(order.status)}\n`;
  message += `💰 *Сумма:* ${order.totalAmount.toLocaleString()} UZS\n`;
  message += `📅 *Дата счета:* ${new Date(order.createdAt).toLocaleDateString(
    "ru-RU"
  )}\n\n`;

  message += `🛍️ *Товары:* \n`;
  order.items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${item.product.name} (${item.size}, ${
      item.color
    }) - ${item.quantity} шт.\n`;
  });

  if (order.status === "shipped") {
    message += `\n🆕 Ваш заказ уже в пути! Скоро курьер свяжется с вами.`;
  }

  return message;
}

/**
 * Handles order search by phone or order number.
 */
export async function handleTracking(
  bot: TelegramBot,
  chatId: number,
  input: string
) {
  await dbConnect();

  // Normalize input
  const cleanInput = input.trim();

  try {
    let orders: any[] = [];

    // Check if it's an order number (e.g., ORD-123-456)
    if (cleanInput.toUpperCase().startsWith("ORD-")) {
      const order = await Order.findOne({
        orderNumber: { $regex: new RegExp(`^${cleanInput}$`, "i") },
      });
      if (order) orders.push(order);
    } else {
      // Treat as phone number
      // Remove all non-numeric characters for comparison if needed,
      // but here we'll search as is first.
      const phoneDigits = cleanInput.replace(/\D/g, "");

      if (phoneDigits.length >= 7) {
        // Search by phone (partial match or regex)
        orders = await Order.find({
          customerPhone: { $regex: phoneDigits },
        })
          .sort({ createdAt: -1 })
          .limit(5);
      }
    }

    if (orders.length === 0) {
      await bot.sendMessage(
        chatId,
        "🔍 К сожалению, заказы не найдены. Проверьте правильность номера телефона или номера заказа."
      );
      return;
    }

    if (orders.length === 1) {
      await bot.sendMessage(chatId, formatOrderMessage(orders[0]), {
        parse_mode: "Markdown",
      });
    } else {
      let listMessage = `📋 **Найдено несколько заказов (${orders.length}):**\n\n`;
      orders.forEach((o, i) => {
        listMessage += `${i + 1}. #${o.orderNumber} - ${translateStatus(
          o.status
        )}\n`;
      });
      listMessage += `\nВведите конкретный номер заказа (например, ORD-XXX), чтобы увидеть детали.`;
      await bot.sendMessage(chatId, listMessage, { parse_mode: "Markdown" });
    }
  } catch (error) {
    console.error("❌ [Telegram Client] Error in tracking:", error);
    await bot.sendMessage(
      chatId,
      "⚠️ Произошла ошибка при поиске заказа. Попробуйте позже."
    );
  }
}
