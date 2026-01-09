import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Print from "@/models/Print";
import { paginationKeyboard, backKeyboard } from "../keyboards";
import { requireAuth } from "./auth";

const ITEMS_PER_PAGE = 5;

export async function handlePrintsList(
  bot: TelegramBot,
  chatId: number,
  page: number = 1
) {
  const isAuth = await requireAuth(bot, chatId);
  if (!isAuth) return;

  await dbConnect();

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const prints = await Print.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ITEMS_PER_PAGE)
    .lean();

  const totalPrints = await Print.countDocuments();
  const totalPages = Math.ceil(totalPrints / ITEMS_PER_PAGE);

  if (prints.length === 0) {
    await bot.sendMessage(chatId, "🎨 No prints found.", {
      reply_markup: backKeyboard,
    });
    return;
  }

  let message = `🎨 *Prints* (Page ${page}/${totalPages})\n\n`;

  prints.forEach((print: any, index: number) => {
    const num = skip + index + 1;
    message += `${num}. *${print.name}*\n`;
    message += `   Category: ${print.category}\n`;
    message += `   Front Image: ${print.frontImage ? "✅" : "❌"}\n`;
    message += `   Back Image: ${print.backImage ? "✅" : "❌"}\n\n`;
  });

  const keyboard =
    totalPages > 1 ? paginationKeyboard(page, totalPages, "prints") : undefined;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: keyboard || backKeyboard,
  });
}
