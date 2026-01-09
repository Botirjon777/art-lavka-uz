import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_ADMIN_BOT_TOKEN;

if (!token) {
  throw new Error(
    "TELEGRAM_ADMIN_BOT_TOKEN is not defined in environment variables"
  );
}

// Prevent multiple bot instances in development
const globalForBot = global as unknown as { bot: TelegramBot };

let bot: TelegramBot;

if (process.env.NODE_ENV === "production") {
  bot = new TelegramBot(token, { polling: false });
} else {
  if (!globalForBot.bot) {
    console.log("🤖 [Telegram] Creating new bot instance with polling...");
    globalForBot.bot = new TelegramBot(token, { polling: true });
  } else {
    console.log("🤖 [Telegram] Using existing bot instance");
  }
  bot = globalForBot.bot;
}

export default bot;
