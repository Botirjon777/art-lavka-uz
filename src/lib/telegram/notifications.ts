import dbConnect from "@/lib/mongodb";
import TelegramSession from "@/models/TelegramSession";

function escapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


export async function sendSupportNotification(support: any) {
  try {
    await dbConnect();

    // Lazy import bot to avoid circular dependencies
    const { default: bot } = await import("./bot");

    // Format support notification message
    let message = `🆘 <b>Запрос в службу поддержки!</b>\n\n`;
    message += `<b>ID:</b> ${escapeHTML(support.orderNumber)}\n\n`;
    
    message += `👤 <b>Клиент:</b>\n`;
    message += `Имя: ${escapeHTML(support.customerName.replace("[SUPPORT] ", ""))}\n`;
    message += `Телефон: ${escapeHTML(support.customerPhone)}\n\n`;
    
    message += `📝 <b>Сообщение:</b>\n`;
    message += `<i>${escapeHTML(support.notes)}</i>\n\n`;
    
    message += `📅 <b>Дата:</b> ${new Date().toLocaleString("ru-RU")}`;

    // 1. Send notification to all authenticated admin sessions
    const sessions = await TelegramSession.find({ isAuthenticated: true });
    if (sessions.length > 0) {
      for (const session of sessions) {
        try {
          await bot.sendMessage(session.chatId, message, {
            parse_mode: "HTML",
          });
        } catch (error) {
          console.error(
            `Failed to send support notification to admin chat ${session.chatId}:`,
            error,
          );
        }
      }
    }

    // 2. Send notification to the specific order group if configured
    const groupId = process.env.TELEGRAM_ORDER_GROUP_ID;
    if (groupId) {
      try {
        await bot.sendMessage(groupId, message, {
          parse_mode: "HTML",
        });
      } catch (error: any) {
        console.error(
          `Failed to send support notification to group ${groupId}:`,
          error,
        );
      }
    }
  } catch (error) {
    console.error("Error sending support notification:", error);
  }
}

export async function sendOrderNotification(order: any) {
  try {
    await dbConnect();

    // Lazy import bot to avoid circular dependencies
    const { default: bot } = await import("./bot");

    // Format order notification message
    const message = formatOrderNotification(order);

    // 1. Send notification to all authenticated admin sessions
    const sessions = await TelegramSession.find({ isAuthenticated: true });
    if (sessions.length > 0) {
      for (const session of sessions) {
        try {
          await bot.sendMessage(session.chatId, message, {
            parse_mode: "HTML",
          });
        } catch (error) {
          console.error(
            `Failed to send notification to admin chat ${session.chatId}:`,
            error,
          );
        }
      }
    }

    // 2. Send notification to the specific order group if configured
    const groupId = process.env.TELEGRAM_ORDER_GROUP_ID;
    if (groupId) {
      try {
        await bot.sendMessage(groupId, message, {
          parse_mode: "HTML",
        });
      } catch (error: any) {
        if (error.response?.body?.parameters?.migrate_to_chat_id) {
          const newGroupId = error.response.body.parameters.migrate_to_chat_id;
          console.error(
            `❌ Telegram Group Upgraded! Please update your .env file:\n` +
              `TELEGRAM_ORDER_GROUP_ID=${newGroupId}`,
          );
        } else {
          console.error(
            `Failed to send notification to group ${groupId}:`,
            error,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
}

export async function broadcastPromoNotification(product: any) {
  try {
    await dbConnect();
    const { default: bot } = await import("./bot");

    const channelId = process.env.TELEGRAM_PROMO_CHANNEL_ID || process.env.CHANNEL_USERNAME;
    const sessions = await TelegramSession.find({ isAuthenticated: true });

    const message = formatPromoMessage(product);

    // 1. Send to all authenticated users
    for (const session of sessions) {
      try {
        if (product.image) {
          await bot.sendPhoto(session.chatId, product.image, {
            caption: message,
            parse_mode: "HTML",
          });
        } else {
          await bot.sendMessage(session.chatId, message, {
            parse_mode: "HTML",
          });
        }
      } catch (error) {
        console.error(`Failed to broadcast to user ${session.chatId}:`, error);
      }
    }

    // 2. Send to channel
    if (channelId) {
      try {
        if (product.image) {
          await bot.sendPhoto(channelId, product.image, {
            caption: message,
            parse_mode: "HTML",
          });
        } else {
          await bot.sendMessage(channelId, message, {
            parse_mode: "HTML",
          });
        }
      } catch (error: any) {
        const botName = process.env.TELEGRAM_ADMIN_BOT_TOKEN?.slice(-5);
        console.error(`Failed to broadcast to channel ${channelId} (Bot: ...${botName}):`, error);
      }
    }
  } catch (error) {
    console.error("Error broadcasting promo:", error);
  }
}

function formatPromoMessage(product: any): string {
  const oldPriceStr = product.oldPrice?.toLocaleString() || "";
  const promoPriceStr = product.promoPrice?.toLocaleString() || "";
  const discountPercent = product.oldPrice && product.promoPrice 
    ? Math.round((1 - product.promoPrice / product.oldPrice) * 100)
    : 0;

  let message = `🔥 <b>АКЦИЯ! СУПЕР ЦЕНА!</b> 🔥\n\n`;
  message += `🛍 <b>${escapeHTML(product.name)}</b>\n\n`;
  
  if (product.description) {
    const cleanDesc = product.description.substring(0, 200) + (product.description.length > 200 ? "..." : "");
    message += `📝 ${escapeHTML(cleanDesc)}\n\n`;
  }

  if (discountPercent > 0) {
    message += `💥 Скидка: <b>-${discountPercent}%</b>\n`;
  }
  
  message += `💰 Цена: <s>${oldPriceStr}</s> ➡️ <b>${promoPriceStr} UZS</b>\n\n`;
  
  message += `✨ Спешите приобрести, пока товар в наличии!`;

  return message;
}

export async function broadcastPublicationNotification(publication: any) {
  try {
    await dbConnect();
    const { default: bot } = await import("./bot");

    const channelId = (process.env.TELEGRAM_PROMO_CHANNEL_ID || process.env.CHANNEL_USERNAME || "").trim();
    if (!channelId) return;
    const sessions = await TelegramSession.find({ isAuthenticated: true });

    const message = formatPublicationMessage(publication);
    
    // Fallback logic for baseUrl to avoid localhost errors in Telegram buttons
    let baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "").trim();
    if (baseUrl.includes("localhost") && process.env.TELEGRAM_WEBHOOK_URL) {
      try {
        baseUrl = new URL(process.env.TELEGRAM_WEBHOOK_URL).origin;
      } catch (e) {}
    }
    
    const trackingLink = `${baseUrl}/api/promo/${publication._id}`;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "🔍 Посмотреть подробнее",
            url: trackingLink,
          },
        ],
      ],
    };

    // 1. Send to all authenticated users
    for (const session of sessions) {
      try {
        if (publication.image) {
          await bot.sendPhoto(session.chatId, publication.image, {
            caption: message,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          });
        } else {
          await bot.sendMessage(session.chatId, message, {
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          });
        }
      } catch (error) {
        console.error(`Failed to broadcast publication ${publication._id} to user ${session.chatId}:`, error);
      }
    }

    // 2. Send to channel
    if (channelId) {
      try {
        if (publication.image) {
          await bot.sendPhoto(channelId, publication.image, {
            caption: message,
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          });
        } else {
          await bot.sendMessage(channelId, message, {
            parse_mode: "HTML",
            reply_markup: replyMarkup,
          });
        }
      } catch (error: any) {
        const botName = process.env.TELEGRAM_ADMIN_BOT_TOKEN?.slice(-5);
        console.error(`Failed to broadcast publication ${publication._id} to channel ${channelId} (Bot: ...${botName}):`, error);
      }
    }
  } catch (error) {
    console.error("Error broadcasting publication:", error);
  }
}

function formatPublicationMessage(publication: any): string {
  let message = `📣 <b>ОБЪЯВЛЕНИЕ</b> 📣\n\n`;
  message += `🌟 <b>${escapeHTML(publication.title)}</b>\n\n`;
  
  if (publication.content) {
    const cleanContent = publication.content.substring(0, 500) + (publication.content.length > 500 ? "..." : "");
    message += `📝 ${escapeHTML(cleanContent)}\n\n`;
  }
  
  message += `🔗 Нажмите кнопку ниже, чтобы узнать больше!`;

  return message;
}

function formatOrderNotification(order: any): string {
  const statusEmoji = getStatusEmoji(order.status);
  const paymentEmoji = getPaymentEmoji(order.paymentStatus);

  const statusMap: Record<string, string> = {
    pending: "Ожидает",
    confirmed: "Подтвержден",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
  };

  const paymentMap: Record<string, string> = {
    pending: "Ожидает",
    paid: "Оплачено",
    failed: "Ошибка",
  };

  let message = `🔔 <b>Получен новый заказ!</b>\n\n`;
  message += `<b>Заказ #:</b> ${escapeHTML(order.orderNumber)}\n`;
  message += `<b>Статус:</b> ${statusEmoji} ${
    statusMap[order.status] || escapeHTML(order.status)
  }\n`;
  message += `<b>Оплата:</b> ${paymentEmoji} ${
    paymentMap[order.paymentStatus] || escapeHTML(order.paymentStatus)
  }\n\n`;

  message += `👤 <b>Клиент:</b>\n`;
  message += `Имя: ${escapeHTML(order.customerName)}\n`;
  message += `Телефон: ${escapeHTML(order.customerPhone)}\n`;
  message += `Регион: ${escapeHTML(order.region)}\n`;
  message += `Район/Город: ${escapeHTML(order.village)}\n`;
  message += `Адрес: ${escapeHTML(order.customerAddress)}\n\n`;

  message += `🛍️ <b>Товары:</b>\n`;
  order.items.forEach((item: any, index: number) => {
    message += `${index + 1}. ${escapeHTML(item.product.name)}\n`;
    message += `   Размер: ${escapeHTML(item.size)} | Цвет: ${escapeHTML(
      item.color,
    )}\n`;
    if (item.print) {
      message += `   Принт: ${escapeHTML(item.print.name)}\n`;
    }
    message += `   Кол-во: ${
      item.quantity
    } × ${item.price.toLocaleString()} = <b>${(
      item.quantity * item.price
    ).toLocaleString()} UZS</b>\n\n`;
  });

  message += `💰 <b>Итого:</b> <u>${order.totalAmount.toLocaleString()} UZS</u>\n`;

  if (order.notes) {
    message += `\n📝 <b>Заметки:</b> <i>${escapeHTML(order.notes)}</i>`;
  }

  return message;
}

function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    processing: "🔄",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  };
  return emojiMap[status] || "❓";
}

function getPaymentEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    pending: "⏳",
    paid: "✅",
    failed: "❌",
  };
  return emojiMap[status] || "❓";
}
