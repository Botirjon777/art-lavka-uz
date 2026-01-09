import mongoose, { Schema, Model } from "mongoose";

export interface ITelegramSession {
  chatId: number;
  adminId: string;
  email: string;
  isAuthenticated: boolean;
  authState?: "awaiting_email" | "awaiting_password";
  tempEmail?: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramSessionSchema = new Schema<ITelegramSession>(
  {
    chatId: {
      type: Number,
      required: true,
      unique: true,
    },
    adminId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    authState: {
      type: String,
      enum: ["awaiting_email", "awaiting_password"],
      required: false,
    },
    tempEmail: {
      type: String,
      required: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete sessions older than 30 days
TelegramSessionSchema.index(
  { lastActivity: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const TelegramSession =
  (mongoose.models.TelegramSession as Model<ITelegramSession>) ||
  mongoose.model<ITelegramSession>("TelegramSession", TelegramSessionSchema);

export default TelegramSession;
