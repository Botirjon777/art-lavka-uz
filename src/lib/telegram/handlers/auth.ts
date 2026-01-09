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
      "✅ You are already authenticated!\n\nUse the menu below to navigate:",
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
    "👋 Welcome to ART LAVKA Admin Bot!\n\n🔐 Please enter your admin email address:",
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
      "❌ Invalid email format. Please enter a valid email address:"
    );
    return;
  }

  // Check if admin exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    await bot.sendMessage(
      chatId,
      "❌ No admin account found with this email.\n\nPlease try again or contact the system administrator."
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

  await bot.sendMessage(chatId, "🔑 Please enter your password:");
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
      "❌ Session expired. Please start again with /start"
    );
    return;
  }

  // Verify password
  const admin = await Admin.findOne({ email: session.tempEmail });
  if (!admin) {
    await bot.sendMessage(
      chatId,
      "❌ Admin not found. Please start again with /start"
    );
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    await bot.sendMessage(chatId, "❌ Incorrect password. Please try again:");
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
    `✅ Authentication successful!\n\nWelcome, ${admin.name}!\n\nUse the menu below to navigate:`,
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
      "🔒 You need to authenticate first. Please use /start to login."
    );
    return false;
  }

  return true;
}
