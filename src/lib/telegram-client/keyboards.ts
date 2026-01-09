import {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
} from "node-telegram-bot-api";

export const subscriptionKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      {
        text: "📢 Подписаться на канал",
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
};

export const mainKeyboard: ReplyKeyboardMarkup = {
  keyboard: [[{ text: "🔍 Отследить заказ" }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const cancelKeyboard: ReplyKeyboardMarkup = {
  keyboard: [[{ text: "❌ Отмена" }]],
  resize_keyboard: true,
};
