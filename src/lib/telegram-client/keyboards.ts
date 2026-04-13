import { ReplyKeyboardMarkup } from "node-telegram-bot-api";

/**
 * Main menu for the client bot.
 */
export const mainMenu: ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "📦 Мои заказы" }, { text: "👕 Каталог" }],
    [{ text: "❓ Помощь" }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

/**
 * Keyboard to request user contact (phone number).
 */
export const contactKeyboard: ReplyKeyboardMarkup = {
  keyboard: [[{ text: "📲 Поделиться номером телефона", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

/**
 * Simple back button menu.
 */
export const backKeyboard: ReplyKeyboardMarkup = {
  keyboard: [[{ text: "🔙 Главное меню" }]],
  resize_keyboard: true,
};
