export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initializeTelegramBot, setupWebhook } = await import(
        "@/lib/telegram"
      );
      initializeTelegramBot();

      if (process.env.NODE_ENV === "production") {
        await setupWebhook();
      }
    } catch (error) {
      console.error(
        "❌ [Instrumentation] Failed to initialize Telegram bot:",
        error
      );
    }
  }
}
