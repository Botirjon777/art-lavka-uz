import TelegramBot from "node-telegram-bot-api";

const CHANNEL_ID = "@artlavkauz";

/**
 * Checks if a user is subscribed to the required channel.
 */
export async function isSubscribed(
  bot: TelegramBot,
  userId: number
): Promise<boolean> {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    const allowedStatuses = ["member", "administrator", "creator"];
    return allowedStatuses.includes(member.status);
  } catch (error) {
    console.error(
      `❌ [Telegram Client] Error checking subscription for ${userId}:`,
      error
    );
    // If we can't check, we assume not subscribed to be safe
    return false;
  }
}

/**
 * Sends a subscription prompt message.
 */
export async function sendSubscriptionPrompt(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    "👋 Добро пожаловать! Для использования бота необходимо подписаться на наш канал: @artlavkauz",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📢 Подписаться на @artlavkauz",
              url: "https://t.me/artlavkauz",
            },
          ],
          [
            {
              text: "✅ Я подписался",
              callback_data: "check_subscription",
            },
          ],
        ],
      },
    }
  );
}
