import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPublication extends Document {
  title: string;
  content?: string;
  image?: string;
  targetUrl: string;
  views: number;
  clicks: number;
  isActive: boolean;
  type: "news" | "promo" | "social";
  lastBroadcastAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["news", "promo", "social"],
      default: "promo",
    },
    lastBroadcastAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Force reload of model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Publication;
}

const Publication =
  (mongoose.models.Publication as Model<IPublication>) ||
  mongoose.model<IPublication>("Publication", PublicationSchema);

export default Publication;
