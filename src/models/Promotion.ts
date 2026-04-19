import mongoose, { Schema, Model } from "mongoose";

export interface IPromotion {
  name: string;
  type: "global" | "targeted";
  conditionType: "min_items" | "min_amount" | "product_selected";
  conditionValue: any; // number or string[]
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  description?: string;
  translations?: Record<string, { name: string; description?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["global", "targeted"], required: true },
    conditionType: {
      type: String,
      enum: ["min_items", "min_amount", "product_selected"],
      required: true,
    },
    conditionValue: { type: Schema.Types.Mixed, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_delivery"],
      required: true,
    },
    discountValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    translations: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).Promotion;
}

const Promotion =
  (mongoose.models.Promotion as Model<IPromotion>) ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
