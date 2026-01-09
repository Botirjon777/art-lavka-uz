import bot from "./bot";
import dbConnect from "@/lib/mongodb";
import TelegramSession from "@/models/TelegramSession";
import {
  handleStart,
  handleEmailInput,
  handlePasswordInput,
} from "./handlers/auth";
import { handleMainMenu } from "./handlers/menu";
import { handleProductsList } from "./handlers/products";
import { handleOrdersList } from "./handlers/orders";
import { handlePrintsList } from "./handlers/prints";
import { handleGalleryList } from "./handlers/gallery";

const INITIALIZED_KEY = "__telegram_bot_initialized__";

/**
 * Registers all message and callback handlers for the bot.
 * This should be called once on server start or in the webhook handler.
 */
export function initializeTelegramBot() {
  const globalObj = global as any;

  if (globalObj[INITIALIZED_KEY]) {
    return;
  }

  console.log("🤖 [Telegram] Registering handlers...");

  try {
    // Single message handler for all text inputs including commands
    bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text) return;

      console.log(`🤖 [Telegram] Message from ${chatId}: ${text}`);

      // Handle commands
      if (text === "/start") {
        await handleStart(bot, chatId);
        return;
      }

      if (text === "/getid") {
        await bot.sendMessage(chatId, `🆔 ID этого чата: \`${chatId}\``, {
          parse_mode: "Markdown",
        });
        return;
      }

      if (text.startsWith("/")) return;

      await dbConnect();

      // Check if user is in authentication flow
      const session = await TelegramSession.findOne({ chatId });

      if (session && !session.isAuthenticated) {
        if (session.authState === "awaiting_email") {
          await handleEmailInput(bot, chatId, text);
          return;
        } else if (session.authState === "awaiting_password") {
          await handlePasswordInput(bot, chatId, text);
          return;
        }
      }

      // Handle menu buttons
      switch (text) {
        case "📦 Товары":
          await handleProductsList(bot, chatId, 1);
          break;
        case "🛍️ Заказы":
          await handleOrdersList(bot, chatId, 1);
          break;
        case "🎨 Принты":
          await handlePrintsList(bot, chatId, 1);
          break;
        case "🖼️ Галерея":
          await handleGalleryList(bot, chatId, 1);
          break;
        case "⬅️ Назад в меню":
          await handleMainMenu(bot, chatId);
          break;
        default:
          if (session && session.isAuthenticated) {
            await bot.sendMessage(
              chatId,
              "❓ Неизвестная команда. Пожалуйста, используйте кнопки меню."
            );
          }
          break;
      }
    });

    // Handle callback queries (pagination)
    bot.on("callback_query", async (query) => {
      const chatId = query.message?.chat.id;
      const data = query.data;

      if (!chatId || !data) return;

      await bot.answerCallbackQuery(query.id);

      if (data === "noop") return;

      const [type, action, pageStr] = data.split("_");
      const page = parseInt(pageStr);

      if (action === "page" && !isNaN(page)) {
        switch (type) {
          case "products":
            await handleProductsList(bot, chatId, page);
            break;
          case "orders":
            await handleOrdersList(bot, chatId, page);
            break;
          case "prints":
            await handlePrintsList(bot, chatId, page);
            break;
          case "gallery":
            await handleGalleryList(bot, chatId, page);
            break;
        }
      }
    });

    console.log("✅ [Telegram] Bot handlers registered successfully!");
    globalObj[INITIALIZED_KEY] = true;
  } catch (error) {
    console.error("❌ [Telegram] Error during initialization:", error);
  }
}

/**
 * Registers the webhook with Telegram.
 * Should be called in production.
 */
export async function setupWebhook() {
  if (process.env.NODE_ENV !== "production") return;

  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("⚠️ [Telegram] TELEGRAM_WEBHOOK_URL is not defined");
    return;
  }

  try {
    console.log(`🤖 [Telegram] Setting up webhook: ${webhookUrl}`);
    const result = await bot.setWebHook(webhookUrl);
    if (result) {
      console.log("✅ [Telegram] Webhook registered successfully");
    } else {
      console.error("❌ [Telegram] Failed to register webhook");
    }
  } catch (error) {
    console.error("❌ [Telegram] Error setting webhook:", error);
  }
}

export { bot };
export { sendOrderNotification } from "./notifications";
