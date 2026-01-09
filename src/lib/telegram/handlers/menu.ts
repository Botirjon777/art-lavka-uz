import TelegramBot from "node-telegram-bot-api";
import { mainMenuKeyboard } from "../keyboards";
import { requireAuth } from "./auth";

export async function handleMainMenu(bot: TelegramBot, chatId: number) {
  const isAuth = await requireAuth(bot, chatId);
  if (!isAuth) return;

  await bot.sendMessage(chatId, "📋 Main Menu\n\nSelect an option:", {
    reply_markup: mainMenuKeyboard,
  });
}
