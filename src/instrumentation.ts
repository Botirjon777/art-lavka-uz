export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initializeTelegramBot } = await import("@/lib/telegram");
      initializeTelegramBot();
    } catch (error) {
      console.error(
        "❌ [Instrumentation] Failed to initialize Telegram bot:",
        error
      );
    }
  }
}
