import mongoose, { Schema, Model } from "mongoose";

export interface IPrintCategory {
  _id: string;
  name: string;
  slug: string;
  translations?: Record<string, { name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const PrintCategorySchema = new Schema<IPrintCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    translations: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

const PrintCategory =
  (mongoose.models.PrintCategory as Model<IPrintCategory>) ||
  mongoose.model<IPrintCategory>("PrintCategory", PrintCategorySchema);

export default PrintCategory;
