import TelegramBot from "node-telegram-bot-api";

export const mainMenuKeyboard: TelegramBot.ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "📦 Товары" }, { text: "🛍️ Заказы" }],
    [{ text: "🎨 Принты" }, { text: "🖼️ Галерея" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

export const backKeyboard: TelegramBot.ReplyKeyboardMarkup = {
  keyboard: [[{ text: "⬅️ Назад в меню" }]],
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
      text: "⬅️ Пред.",
      callback_data: `${type}_page_${currentPage - 1}`,
    });
  }

  buttons.push({
    text: `${currentPage}/${totalPages}`,
    callback_data: "noop",
  });

  if (currentPage < totalPages) {
    buttons.push({
      text: "След. ➡️",
      callback_data: `${type}_page_${currentPage + 1}`,
    });
  }

  if (buttons.length > 0) {
    keyboard.push(buttons);
  }

  return { inline_keyboard: keyboard };
};
