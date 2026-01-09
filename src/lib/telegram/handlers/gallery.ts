import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { paginationKeyboard, backKeyboard } from "../keyboards";
import { requireAuth } from "./auth";

const ITEMS_PER_PAGE = 5;

export async function handleGalleryList(
  bot: TelegramBot,
  chatId: number,
  page: number = 1
) {
  const isAuth = await requireAuth(bot, chatId);
  if (!isAuth) return;

  await dbConnect();

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const galleryItems = await Gallery.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const totalItems = await Gallery.countDocuments();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (galleryItems.length === 0) {
    await bot.sendMessage(chatId, "🖼️ No gallery items found.", {
      reply_markup: backKeyboard,
    });
    return;
  }

  let message = `🖼️ *Gallery* (Page ${page}/${totalPages})\n\n`;

  galleryItems.forEach((item: any, index: number) => {
    const num = skip + index + 1;
    message += `${num}. *${item.title || "Untitled"}*\n`;
    message += `   Image: ${item.image ? "✅" : "❌"}\n`;
    if (item.description) {
      message += `   Description: ${item.description.substring(0, 50)}${
        item.description.length > 50 ? "..." : ""
      }\n`;
    }
    message += `\n`;
  });

  const keyboard =
    totalPages > 1
      ? paginationKeyboard(page, totalPages, "gallery")
      : undefined;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard || backKeyboard,
  });
}
