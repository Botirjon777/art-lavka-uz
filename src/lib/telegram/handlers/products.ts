import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { paginationKeyboard, backKeyboard } from "../keyboards";
import { requireAuth } from "./auth";

const ITEMS_PER_PAGE = 5;

export async function handleProductsList(
  bot: TelegramBot,
  chatId: number,
  page: number = 1
) {
  const isAuth = await requireAuth(bot, chatId);
  if (!isAuth) return;

  await dbConnect();

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  if (products.length === 0) {
    await bot.sendMessage(chatId, "📦 No products found.", {
      reply_markup: backKeyboard,
    });
    return;
  }

  let message = `📦 *Products* (Page ${page}/${totalPages})\n\n`;

  products.forEach((product: any, index: number) => {
    const num = skip + index + 1;
    message += `${num}. *${product.name}*\n`;
    message += `   Category: ${product.category}\n`;
    message += `   Price: ${product.price.toLocaleString()} UZS\n`;
    message += `   Stock: ${product.stock}\n`;
    message += `   Colors: ${
      product.colors?.map((c: any) => c.name).join(", ") || "N/A"
    }\n`;
    message += `   Sizes: ${product.sizes?.join(", ") || "N/A"}\n\n`;
  });

  const keyboard =
    totalPages > 1
      ? paginationKeyboard(page, totalPages, "products")
      : undefined;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard || backKeyboard,
  });
}
