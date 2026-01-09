export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Initialize Admin Bot
      const { initializeTelegramBot, setupWebhook } = await import(
        "@/lib/telegram"
      );
      initializeTelegramBot();

      // Initialize Client Bot
      const { initializeClientBot, setupClientWebhook } = await import(
        "@/lib/telegram-client"
      );
      initializeClientBot();

      if (process.env.NODE_ENV === "production") {
        await setupWebhook();
        await setupClientWebhook();
      }
    } catch (error) {
      console.error(
        "❌ [Instrumentation] Failed to initialize Telegram bot:",
        error
      );
    }
  }
}
