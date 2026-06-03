import mongoose, { Schema, Model } from "mongoose";

export interface IPrint {
  name: string;
  frontImage: string;
  frontImagePreview?: string;
  backImage?: string;
  category: "national" | "stylish" | "funny" | "all";
  active: boolean;
  translations?: {
    en?: { name: string };
    ru?: { name: string };
    uz?: { name: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const PrintSchema = new Schema<IPrint>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    frontImage: {
      type: String,
      required: true,
    },
    frontImagePreview: {
      type: String,
      required: false,
    },
    backImage: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    translations: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Storefront paginates active prints, optionally filtered by category, by recency.
PrintSchema.index({ active: 1, category: 1, createdAt: -1 });

const Print =
  (mongoose.models.Print as Model<IPrint>) ||
  mongoose.model<IPrint>("Print", PrintSchema);

export default Print;
