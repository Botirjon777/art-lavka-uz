console.log("🤖 [Telegram] Init script loaded");

import("@/lib/telegram")
  .then(({ initializeTelegramBot }) => {
    console.log("🤖 [Telegram] Calling initialize...");
    initializeTelegramBot();
  })
  .catch((error) => {
    console.error("❌ [Telegram] Failed to load telegram lib:", error);
  });

export {};
