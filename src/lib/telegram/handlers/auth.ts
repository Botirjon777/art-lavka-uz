import TelegramBot from "node-telegram-bot-api";
import dbConnect from "@/lib/mongodb";
import TelegramSession from "@/models/TelegramSession";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { mainMenuKeyboard } from "../keyboards";

export async function handleStart(bot: TelegramBot, chatId: number) {
  await dbConnect();

  // Check if user already has an active session
  const existingSession = await TelegramSession.findOne({ chatId });

  if (existingSession && existingSession.isAuthenticated) {
    await bot.sendMessage(
      chatId,
      "✅ Вы уже авторизованы!\n\nИспользуйте меню ниже для навигации:",
      { reply_markup: mainMenuKeyboard }
    );
    return;
  }

  // Start authentication flow
  await TelegramSession.findOneAndUpdate(
    { chatId },
    {
      chatId,
      isAuthenticated: false,
      authState: "awaiting_email",
      lastActivity: new Date(),
    },
    { upsert: true, new: true }
  );

  await bot.sendMessage(
    chatId,
    "👋 Добро пожаловать в админ-бот ART LAVKA!\n\n🔐 Пожалуйста, введите ваш email адрес:",
    { reply_markup: { remove_keyboard: true } }
  );
}

export async function handleEmailInput(
  bot: TelegramBot,
  chatId: number,
  email: string
) {
  await dbConnect();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    await bot.sendMessage(
      chatId,
      "❌ Неверный формат email. Пожалуйста, введите корректный адрес:"
    );
    return;
  }

  // Check if admin exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    await bot.sendMessage(
      chatId,
      "❌ Аккаунт администратора с таким email не найден.\n Пожалуйста, попробуйте еще раз или свяжитесь с системным администратором."
    );
    await handleStart(bot, chatId);
    return;
  }

  // Save email temporarily and ask for password
  await TelegramSession.findOneAndUpdate(
    { chatId },
    {
      authState: "awaiting_password",
      tempEmail: email,
      lastActivity: new Date(),
    }
  );

  await bot.sendMessage(chatId, "🔑 Пожалуйста, введите ваш пароль:");
}

export async function handlePasswordInput(
  bot: TelegramBot,
  chatId: number,
  password: string
) {
  await dbConnect();

  const session = await TelegramSession.findOne({ chatId });
  if (!session || !session.tempEmail) {
    await bot.sendMessage(
      chatId,
      "❌ Сессия истекла. Пожалуйста, начните заново с команды /start"
    );
    return;
  }

  // Verify password
  const admin = await Admin.findOne({ email: session.tempEmail });
  if (!admin) {
    await bot.sendMessage(
      chatId,
      "❌ Администратор не найден. Пожалуйста, начните заново с команды /start"
    );
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    await bot.sendMessage(
      chatId,
      "❌ Неверный пароль. Пожалуйста, попробуйте еще раз:"
    );
    return;
  }

  // Authentication successful
  await TelegramSession.findOneAndUpdate(
    { chatId },
    {
      adminId: admin._id.toString(),
      email: admin.email,
      isAuthenticated: true,
      authState: undefined,
      tempEmail: undefined,
      lastActivity: new Date(),
    }
  );

  await bot.sendMessage(
    chatId,
    `✅ Авторизация прошла успешно!\n\nДобро пожаловать, ${admin.name}!\n\nИспользуйте меню ниже для навигации:`,
    { reply_markup: mainMenuKeyboard }
  );
}

export async function checkAuthentication(chatId: number): Promise<boolean> {
  await dbConnect();

  const session = await TelegramSession.findOne({ chatId });

  if (!session || !session.isAuthenticated) {
    return false;
  }

  // Update last activity
  await TelegramSession.findOneAndUpdate(
    { chatId },
    { lastActivity: new Date() }
  );

  return true;
}

export async function requireAuth(
  bot: TelegramBot,
  chatId: number
): Promise<boolean> {
  const isAuthenticated = await checkAuthentication(chatId);

  if (!isAuthenticated) {
    await bot.sendMessage(
      chatId,
      "🔒 Вам необходимо авторизоваться. Пожалуйста, используйте /start для входа."
    );
    return false;
  }

  return true;
}
