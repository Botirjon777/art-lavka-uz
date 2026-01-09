import TelegramBot from "node-telegram-bot-api";

export const mainMenuKeyboard: TelegramBot.ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "📦 Products" }, { text: "🛍️ Orders" }],
    [{ text: "🎨 Prints" }, { text: "🖼️ Gallery" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const backKeyboard: TelegramBot.ReplyKeyboardMarkup = {
  keyboard: [[{ text: "⬅️ Back to Menu" }]],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const paginationKeyboard = (
  currentPage: number,
  totalPages: number,
  type: string
): TelegramBot.InlineKeyboardMarkup => {
  const keyboard: TelegramBot.InlineKeyboardButton[][] = [];

  const buttons: TelegramBot.InlineKeyboardButton[] = [];

  if (currentPage > 1) {
    buttons.push({
      text: "⬅️ Previous",
      callback_data: `${type}_page_${currentPage - 1}`,
    });
  }

  buttons.push({
    text: `${currentPage}/${totalPages}`,
    callback_data: "noop",
  });

  if (currentPage < totalPages) {
    buttons.push({
      text: "Next ➡️",
      callback_data: `${type}_page_${currentPage + 1}`,
    });
  }

  if (buttons.length > 0) {
    keyboard.push(buttons);
  }

  return { inline_keyboard: keyboard };
};
