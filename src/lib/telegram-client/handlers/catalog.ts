import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { mainMenu } from "../keyboards";

/**
 * Handles showing featured products to the user.
 */
export async function handleCatalog(bot: TelegramBot, chatId: number) {
  await dbConnect();

  try {
    // Get 3 active products
    const products = await Product.find({ active: true }).limit(3).lean();

    if (products.length === 0) {
      await bot.sendMessage(
        chatId,
        "👕 В данный момент каталог пуст. Пожалуйста, загляните попозже!",
        { reply_markup: mainMenu }
      );
      return;
    }

    await bot.sendMessage(
      chatId,
      "✨ *Наши популярные товары:* \n\nПосмотрите наш полный каталог на сайте!",
      { parse_mode: "Markdown" }
    );

    for (const product of products as any) {
      const caption = `👕 *${product.name}*\n💰 Цена: ${product.price.toLocaleString()} UZS\n\n${product.description || ""
        }`;

      // Use the product image (Cloudinary or local)
      await bot.sendPhoto(chatId, product.image, {
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔎 Посмотреть на сайте",
                url: `https://www.art-lavka.uz/product/${product._id}`,
              },
            ],
          ],
        },
      });
    }

    await bot.sendMessage(
      chatId,
      "👉 Вы можете увидеть все товары на нашем сайте: https://www.art-lavka.uz",
      { reply_markup: mainMenu }
    );
  } catch (error) {
    console.error("❌ [Telegram Client] Error in catalog handler:", error);
    await bot.sendMessage(
      chatId,
      "⚠️ Произошла ошибка при загрузке каталога. Попробуйте позже.",
      { reply_markup: mainMenu }
    );
  }
}
