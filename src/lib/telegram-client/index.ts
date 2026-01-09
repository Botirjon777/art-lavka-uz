import bot from "./bot";
import dbConnect from "@/lib/mongodb";
import { isSubscribed, sendSubscriptionPrompt } from "./handlers/subscription";
import { handleTracking } from "./handlers/tracking";

const INITIALIZED_KEY = "__telegram_client_bot_initialized__";

/**
 * Handles incoming message updates for the client bot.
 */
export async function handleClientMessage(msg: any) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  console.log(`🤖 [Telegram Client] Message from ${chatId}: ${text}`);

  if (text === "/start") {
    const subscribed = await isSubscribed(bot, msg.from.id);
    if (!subscribed) {
      await sendSubscriptionPrompt(bot, chatId);
    } else {
      await bot.sendMessage(
        chatId,
        "✅ Вы подписаны! Введите ваш **номер телефона** или **номер заказа** (например, ORD-123), чтобы узнать статус заказа.",
        { parse_mode: "Markdown" }
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

  // If subscribed, treat text as tracking input
  await handleTracking(bot, chatId, text);
}

/**
 * Handles incoming callback query updates for the client bot.
 */
export async function handleClientCallbackQuery(query: any) {
  const chatId = query.message?.chat.id;
  const data = query.data;

  if (!chatId || !data) return;

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
