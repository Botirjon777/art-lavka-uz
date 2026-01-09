import { NextRequest, NextResponse } from "next/server";
import {
  bot,
  initializeTelegramBot,
  handleIncomingMessage,
  handleIncomingCallbackQuery,
} from "@/lib/telegram";

/**
 * Handles incoming updates from Telegram via webhook.
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure handlers are registered (for bot state stability)
    initializeTelegramBot();

    const body = await req.json();

    console.log(
      "🤖 [Telegram Webhook] Received update:",
      JSON.stringify(body, null, 2)
    );

    // Manually route the update and AWAIT it.
    // This is CRITICAL for Vercel/Serverless functions to ensure
    // the code finishes before the function is terminated.
    if (body.message) {
      await handleIncomingMessage(body.message);
    } else if (body.callback_query) {
      await handleIncomingCallbackQuery(body.callback_query);
    } else {
      // For any other types of updates, we can fallback to processUpdate
      // but they might not be fully awaited.
      bot.processUpdate(body);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("❌ [Telegram Webhook] Error processing update:", error);
    // Always return 200 to Telegram unless it's a critical infrastructure error
    // so it doesn't keep retrying failed messages indefinitely.
    return NextResponse.json(
      { ok: false, error: error.message || "Internal Server Error" },
      { status: 200 }
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
      { status: 200 } // Return 200 even on error for debugging viewability
    );
  }
}
