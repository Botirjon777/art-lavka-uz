import { NextRequest, NextResponse } from "next/server";
import {
  bot,
  handleClientMessage,
  handleClientCallbackQuery,
  initializeClientBot,
} from "@/lib/telegram-client";

export async function POST(req: NextRequest) {
  try {
    // Ensure handlers are registered
    initializeClientBot();

    const body = await req.json();

    console.log(
      "🤖 [Telegram Client Webhook] Received update:",
      JSON.stringify(body, null, 2)
    );

    if (body.message) {
      await handleClientMessage(body.message);
    } else if (body.callback_query) {
      await handleClientCallbackQuery(body.callback_query);
    } else {
      bot.processUpdate(body);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error(
      "❌ [Telegram Client Webhook] Error processing update:",
      error
    );
    return NextResponse.json(
      { ok: false, error: error.message || "Internal Server Error" },
      { status: 200 }
    );
  }
}

export async function GET() {
  try {
    initializeClientBot();

    if (process.env.NODE_ENV === "production") {
      const { setupClientWebhook } = await import("@/lib/telegram-client");
      await setupClientWebhook();
    }

    const me = await bot.getMe();
    const webhookInfo = await bot.getWebHookInfo();

    return NextResponse.json({
      ok: true,
      bot: {
        id: me.id,
        first_name: me.first_name,
        username: me.username,
      },
      webhook: {
        url: webhookInfo.url,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_message: webhookInfo.last_error_message,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_TOKEN: !!process.env.TELEGRAM_CLIENT_BOT_TOKEN,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 200 }
    );
  }
}
