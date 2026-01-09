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
    await bot.sendMessage(chatId, "🛍️ No orders found.", {
      reply_markup: backKeyboard,
    });
    return;
  }

  let message = `🛍️ *Orders* (Page ${page}/${totalPages})\n\n`;

  orders.forEach((order: any, index: number) => {
    const num = skip + index + 1;
    const statusEmoji = getStatusEmoji(order.status);
    const paymentEmoji = getPaymentEmoji(order.paymentStatus);

    message += `${num}. *${order.orderNumber}*\n`;
    message += `   Customer: ${order.customerName}\n`;
    message += `   Phone: ${order.customerPhone}\n`;
    message += `   Region: ${order.region}\n`;
    message += `   Status: ${statusEmoji} ${order.status}\n`;
    message += `   Payment: ${paymentEmoji} ${order.paymentStatus}\n`;
    message += `   Total: ${order.totalAmount.toLocaleString()} UZS\n`;
    message += `   Items: ${order.items.length}\n`;
    message += `   Date: ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
  });

  const keyboard =
    totalPages > 1 ? paginationKeyboard(page, totalPages, "orders") : undefined;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard || backKeyboard,
  });
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
