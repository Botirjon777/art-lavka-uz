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
    if (item.print) {
      message += `   🎨 *Принт:* ${item.print.name}\n`;
    }
  });

  if (order.status === "shipped") {
    message += `\n🆕 Ваш заказ уже в пути! Скоро курьер свяжется с вами.`;
  }

  return message;
}

/**
 * Prompts the user to provide their phone number or order ID.
 */
export async function handleMyOrdersPrompt(bot: TelegramBot, chatId: number) {
  const { contactKeyboard } = await import("../keyboards");

  await bot.sendMessage(
    chatId,
    "📦 *Чтобы найти ваши заказы:* \n\nНажмите на кнопку ниже, чтобы поделиться вашим номером, или просто напишите ваш номер телефона или номер заказа вручную.",
    {
      parse_mode: "Markdown",
      reply_markup: contactKeyboard,
    }
  );
}

/**
 * Handles order search by phone or order number.
 */
export async function handleTracking(
  bot: TelegramBot,
  chatId: number,
  input: string
) {
  const { mainMenu } = await import("../keyboards");
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
      const phoneDigits = cleanInput.replace(/\D/g, "");

      if (phoneDigits.length >= 7) {
        // Search by phone
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
        "🔍 К сожалению, заказы не найдены. Проверьте правильность номера телефона или номера заказа.",
        { reply_markup: mainMenu }
      );
      return;
    }

    if (orders.length === 1) {
      await bot.sendMessage(chatId, formatOrderMessage(orders[0]), {
        parse_mode: "Markdown",
        reply_markup: mainMenu,
      });
    } else {
      // Create inline keyboard buttons for each order
      const keyboard = orders.map((order) => {
        const shortOrderId = order.orderNumber.slice(-5);
        const statusText = translateStatus(order.status);
        const orderDate = new Date(order.createdAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });

        const buttonText = `...${shortOrderId} | ${statusText} | ${orderDate}`;

        return [
          {
            text: buttonText,
            callback_data: `order_${order.orderNumber}`,
          },
        ];
      });

      await bot.sendMessage(
        chatId,
        `📋 *Найдено несколько заказов (${orders.length}):*\n\nНажмите на заказ, чтобы увидеть детали:`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );
    }
  } catch (error) {
    console.error("❌ [Telegram Client] Error in tracking:", error);
    await bot.sendMessage(
      chatId,
      "⚠️ Произошла ошибка при поиске заказа. Попробуйте позже.",
      { reply_markup: mainMenu }
    );
  }
}
