import bot from "./bot";
import dbConnect from "@/lib/mongodb";
import { isSubscribed, sendSubscriptionPrompt } from "./handlers/subscription";
import { handleTracking, handleMyOrdersPrompt } from "./handlers/tracking";
import { handleCatalog } from "./handlers/catalog";
import { mainMenu } from "./keyboards";

const INITIALIZED_KEY = "__telegram_client_bot_initialized__";

/**
 * Handles incoming message updates for the client bot.
 */
export async function handleClientMessage(msg: any) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const contact = msg.contact;

  console.log(`🤖 [Telegram Client] Message from ${chatId}: ${text || "[Media/Contact]"}`);

  // 1. Handle Contact Sharing
  if (contact) {
    const subscribed = await isSubscribed(bot, msg.from.id);
    if (!subscribed) {
      await sendSubscriptionPrompt(bot, chatId);
      return;
    }
    const phoneNumber = contact.phone_number;
    await bot.sendMessage(chatId, `🔍 Ищу заказы для номера: ${phoneNumber}...`);
    await handleTracking(bot, chatId, phoneNumber);
    return;
  }

  if (!text) return;

  // 2. Handle Commands and Menu Buttons
  if (text === "/start" || text === "🔙 Главное меню") {
    const subscribed = await isSubscribed(bot, msg.from.id);
    if (!subscribed) {
      await sendSubscriptionPrompt(bot, chatId);
    } else {
      await bot.sendMessage(
        chatId,
        "👋 Добро пожаловать в Art Lavka! \n\nВыберите нужный раздел в меню ниже:",
        { 
          parse_mode: "Markdown",
          reply_markup: mainMenu 
        }
      );
    }
    return;
  }

  // Check subscription before any other action
  const subscribed = await isSubscribed(bot, msg.from.id);
  if (!subscribed) {
    await sendSubscriptionPrompt(bot, chatId);
    return;
  }

  // 3. Handle specific menu buttons
  if (text === "📦 Мои заказы") {
    await handleMyOrdersPrompt(bot, chatId);
    return;
  }

  if (text === "👕 Каталог") {
    await handleCatalog(bot, chatId);
    return;
  }

  if (text === "❓ Помощь") {
    await bot.sendMessage(
      chatId,
      "ℹ️ *Как пользоваться ботом:* \n\n" +
      "1. Нажмите **'📦 Мои заказы'**, чтобы найти историю ваших покупок.\n" +
      "2. Нажмите **'👕 Каталог'**, чтобы посмотреть наши товары.\n" +
      "3. Вы всегда можете просто написать **номер заказа** (например, ORD-123) или **номер телефона**, чтобы узнать статус.\n\n" +
      "Если у вас есть вопросы, пишите нашему менеджеру: @artlavkauz_admin",
      { parse_mode: "Markdown", reply_markup: mainMenu }
    );
    return;
  }

  // 4. Default: Treat text as tracking input (phone or order number)
  await handleTracking(bot, chatId, text);
}

/**
 * Handles incoming callback query updates for the client bot.
 */
export async function handleClientCallbackQuery(query: any) {
  const chatId = query.message?.chat.id;
  const data = query.data;

  if (!chatId || !data) return;

  // Handle order button clicks
  if (data.startsWith("order_")) {
    const orderNumber = data.replace("order_", "");

    // Answer the callback query first
    await bot.answerCallbackQuery(query.id);

    // Show order details
    await handleTracking(bot, chatId, orderNumber);
    return;
  }

  if (data === "check_subscription") {
    const subscribed = await isSubscribed(bot, query.from.id);
    if (subscribed) {
      await bot.answerCallbackQuery(query.id, {
        text: "✅ Подписка подтверждена!",
      });
      await bot.sendMessage(
        chatId,
        "🎉 Отлично! Теперь напишите ваш **номер телефона** или **номер заказа**, чтобы я нашел информацию."
      );
    } else {
      await bot.answerCallbackQuery(query.id, {
        text: "❌ Вы еще не подписались на канал @artlavkauz",
        show_alert: true,
      });
    }
  }
}

/**
 * Initializes the client bot handlers (polling mode).
 */
export function initializeClientBot() {
  const globalObj = global as any;

  if (globalObj[INITIALIZED_KEY]) {
    return;
  }

  if (!process.env.TELEGRAM_CLIENT_BOT_TOKEN) return;

  console.log("🤖 [Telegram Client] Registering handlers...");

  try {
    bot.on("message", async (msg) => {
      try {
        await handleClientMessage(msg);
      } catch (error) {
        console.error("❌ [Telegram Client] Error handling message:", error);
      }
    });

    bot.on("callback_query", async (query) => {
      try {
        await handleClientCallbackQuery(query);
      } catch (error) {
        console.error(
          "❌ [Telegram Client] Error handling callback query:",
          error
        );
      }
    });

    console.log("✅ [Telegram Client] Bot handlers registered successfully!");
    globalObj[INITIALIZED_KEY] = true;
  } catch (error) {
    console.error("❌ [Telegram Client] Error during initialization:", error);
  }
}

/**
 * Registers the webhook for the client bot in production.
 */
export async function setupClientWebhook() {
  if (process.env.NODE_ENV !== "production") return;

  const webhookUrl = process.env.TELEGRAM_CLIENT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    console.log(`🤖 [Telegram Client] Setting up webhook: ${webhookUrl}`);
    await bot.setWebHook(webhookUrl);
  } catch (error) {
    console.error("❌ [Telegram Client] Error setting webhook:", error);
  }
}

export { bot };
