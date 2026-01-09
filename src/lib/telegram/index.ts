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

// Initialize bot handlers
export function initializeTelegramBot() {
  const globalForHandlers = global as unknown as {
    telegramHandlersInitialized: boolean;
  };

  if (globalForHandlers.telegramHandlersInitialized) {
    return;
  }

  console.log("🤖 [Telegram] Initializing bot handlers...");

  try {
    // Single message handler for all text inputs including commands
    bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text) return;

      // Log incoming messages for debugging
      console.log(`🤖 [Telegram] Message from ${chatId}: ${text}`);

      // Handle the /start command explicitly
      if (text === "/start") {
        await handleStart(bot, chatId);
        return;
      }

      // Skip other commands if they are ever added
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
          // Unknown command
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

      // Answer the callback query to remove loading state
      await bot.answerCallbackQuery(query.id);

      if (data === "noop") return;

      // Parse pagination data
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

    console.log("✅ [Telegram] Bot initialized successfully!");
    globalForHandlers.telegramHandlersInitialized = true;
  } catch (error) {
    console.error("❌ [Telegram] Error during initialization:", error);
  }
}

// Export bot instance for use in other parts of the application
export { bot };
export { sendOrderNotification } from "./notifications";
