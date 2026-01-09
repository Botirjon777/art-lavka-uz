import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

if (!token) {
  // We use console.warn instead of throw so it doesn't crash the whole app if not set
  console.warn("⚠️ TELEGRAM_CLIENT_BOT_TOKEN is not defined");
}

const globalForClientBot = global as unknown as { clientBot: TelegramBot };

let clientBot: TelegramBot;

if (process.env.NODE_ENV === "production") {
  clientBot = new TelegramBot(token || "", { polling: false });
} else {
  if (!globalForClientBot.clientBot && token) {
    console.log(
      "🤖 [Telegram Client] Creating new bot instance with polling..."
    );
    globalForClientBot.clientBot = new TelegramBot(token, { polling: true });
  }
  clientBot = globalForClientBot.clientBot;
}

export default clientBot;
