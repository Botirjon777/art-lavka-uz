import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { paginationKeyboard, backKeyboard } from "../keyboards";
import { requireAuth } from "./auth";

const ITEMS_PER_PAGE = 5;

export async function handleOrdersList(
  bot: TelegramBot,
  chatId: number,
  page: number = 1
) {
  const isAuth = await requireAuth(bot, chatId);
  if (!isAuth) return;

  await dbConnect();

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const totalOrders = await Order.countDocuments();
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  if (orders.length === 0) {
    await bot.sendMessage(chatId, "🛍️ Заказы не найдены.", {
      reply_markup: backKeyboard,
    });
    return;
  }

  let message = `🛍️ *Заказы* (Страница ${page}/${totalPages})\n\n`;

  orders.forEach((order: any, index: number) => {
    const num = skip + index + 1;
    const statusEmoji = getStatusEmoji(order.status);
    const paymentEmoji = getPaymentEmoji(order.paymentStatus);

    message += `${num}. *${order.orderNumber}*\n`;
    message += `   Клиент: ${order.customerName}\n`;
    message += `   Телефон: ${order.customerPhone}\n`;
    message += `   Регион: ${order.region}\n`;
    message += `   Статус: ${statusEmoji} ${translateStatus(order.status)}\n`;
    message += `   Оплата: ${paymentEmoji} ${translatePaymentStatus(
      order.paymentStatus
    )}\n`;
    message += `   Сумма: ${order.totalAmount.toLocaleString()} UZS\n`;
    message += `   Товары:\n`;
    order.items.forEach((item: any) => {
      message += `    • ${item.product.name} ${item.print ? `(+${item.print.name})` : ""}\n`;
    });
    message += `   Дата: ${new Date(order.createdAt).toLocaleDateString(
      "ru-RU"
    )}\n\n`;
  });

  const keyboard =
    totalPages > 1 ? paginationKeyboard(page, totalPages, "orders") : undefined;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard || backKeyboard,
  });
}

function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Ожидает",
    confirmed: "Подтвержден",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
  };
  return statusMap[status] || status;
}

function translatePaymentStatus(status: string): string {
  const paymentMap: Record<string, string> = {
    pending: "Ожидает",
    paid: "Оплачено",
    failed: "Ошибка",
  };
  return paymentMap[status] || status;
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
