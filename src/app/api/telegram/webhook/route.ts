import { NextRequest, NextResponse } from "next/server";
import { bot, initializeTelegramBot } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    // Ensure handlers are initialized (this is a no-op if already done)
    initializeTelegramBot();

    const body = await req.json();

    // Log for debugging in production (Vercel logs)
    console.log(
      "🤖 [Telegram Webhook] Received update:",
      JSON.stringify(body, null, 2)
    );

    // Process the update through the bot instance
    // This will trigger the handlers defined in lib/telegram/index.ts
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

// Optional: Handle GET requests if Telegram or a human tries to browse here
export async function GET() {
  return NextResponse.json({
    message:
      "Telegram Bot Webhook is active. Send POST requests from Telegram.",
  });
}
