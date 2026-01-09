import { NextRequest, NextResponse } from "next/server";
import { bot, initializeTelegramBot } from "@/lib/telegram";

/**
 * Handles incoming updates from Telegram via webhook.
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure handles are registered
    initializeTelegramBot();

    const body = await req.json();

    // In a serverless environment, we need to process the update.
    // Note: processUpdate doesn't return a promise, so if your handlers
    // perform significant async work, the function might terminate early.
    // However, most bot actions are triggered synchronously here.
    bot.processUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("❌ [Telegram Webhook] Error processing update:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Debugging endpoint to check bot status and webhook configuration.
 */
export async function GET() {
  try {
    // Ensure handles are registered and webhook is set
    initializeTelegramBot();
    let setupResult = "skipped";
    if (process.env.NODE_ENV === "production") {
      const { setupWebhook } = await import("@/lib/telegram");
      await setupWebhook();
      setupResult = "attempted";
    }

    const me = await bot.getMe();
    const webhookInfo = await bot.getWebHookInfo();

    return NextResponse.json({
      ok: true,
      setup_result: setupResult,
      bot: {
        id: me.id,
        first_name: me.first_name,
        username: me.username,
      },
      webhook: {
        url: webhookInfo.url,
        has_custom_certificate: webhookInfo.has_custom_certificate,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_date: webhookInfo.last_error_date,
        last_error_message: webhookInfo.last_error_message,
        max_connections: webhookInfo.max_connections,
        ip_address: webhookInfo.ip_address,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_TOKEN: !!process.env.TELEGRAM_ADMIN_BOT_TOKEN,
        HAS_WEBHOOK_URL: !!process.env.TELEGRAM_WEBHOOK_URL,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to get bot info",
        details: "Ensure TELEGRAM_ADMIN_BOT_TOKEN is correct.",
      },
      { status: 500 }
    );
  }
}
