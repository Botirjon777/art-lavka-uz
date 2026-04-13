import dbConnect from "@/lib/mongodb";
import TelegramSession from "@/models/TelegramSession";

function escapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendOrderNotification(order: any) {
  try {
    await dbConnect();

    // Lazy import bot to avoid circular dependencies
    const { default: bot } = await import("./bot");

    // Format order notification message
    const message = formatOrderNotification(order);

    // 1. Send notification to all authenticated admin sessions
    const sessions = await TelegramSession.find({ isAuthenticated: true });
    if (sessions.length > 0) {
      for (const session of sessions) {
        try {
          await bot.sendMessage(session.chatId, message, {
            parse_mode: "HTML",
          });
        } catch (error) {
          console.error(
            `Failed to send notification to admin chat ${session.chatId}:`,
            error
          );
        }
      }
      console.log(`Order notification sent to ${sessions.length} admin(s)`);
    } else {
      console.log("No individual authenticated Telegram sessions found.");
    }

    // 2. Send notification to the specific order group if configured
    const groupId = process.env.TELEGRAM_ORDER_GROUP_ID;
    if (groupId) {
      try {
        await bot.sendMessage(groupId, message, {
          parse_mode: "HTML",
        });
        console.log(`Order notification sent to group ${groupId}`);
      } catch (error) {
        console.error(
          `Failed to send notification to group ${groupId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
}

function formatOrderNotification(order: any): string {
  const statusEmoji = getStatusEmoji(order.status);
  const paymentEmoji = getPaymentEmoji(order.paymentStatus);

  const statusMap: Record<string, string> = {
    pending: "Ожидает",
    confirmed: "Подтвержден",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
  };

  const paymentMap: Record<string, string> = {
    pending: "Ожидает",
    paid: "Оплачено",
    failed: "Ошибка",
  };

  let message = `🔔 <b>Получен новый заказ!</b>\n\n`;
  message += `<b>Заказ #:</b> ${escapeHTML(order.orderNumber)}\n`;
  message += `<b>Статус:</b> ${statusEmoji} ${
    statusMap[order.status] || escapeHTML(order.status)
  }\n`;
  message += `<b>Оплата:</b> ${paymentEmoji} ${
    paymentMap[order.paymentStatus] || escapeHTML(order.paymentStatus)
  }\n\n`;

  message += `👤 <b>Клиент:</b>\n`;
  message += `Имя: ${escapeHTML(order.customerName)}\n`;
  message += `Телефон: ${escapeHTML(order.customerPhone)}\n`;
  message += `Регион: ${escapeHTML(order.region)}\n`;
  message += `Адрес: ${escapeHTML(order.customerAddress)}\n\n`;

  message += `🛍️ <b>Товары:</b>\n`;
  order.items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${escapeHTML(item.product.name)}\n`;
    message += `   Размер: ${escapeHTML(item.size)} | Цвет: ${escapeHTML(
      item.color
    )}\n`;
    if (item.print) {
      message += `   Принт: ${escapeHTML(item.print.name)}\n`;
    }
    message += `   Кол-во: ${
      item.quantity
    } × ${item.price.toLocaleString()} = <b>${(
      item.quantity * item.price
    ).toLocaleString()} UZS</b>\n\n`;
  });

  message += `💰 <b>Итого:</b> <u>${order.totalAmount.toLocaleString()} UZS</u>\n`;

  if (order.notes) {
    message += `\n📝 <b>Заметки:</b> <i>${escapeHTML(order.notes)}</i>`;
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
