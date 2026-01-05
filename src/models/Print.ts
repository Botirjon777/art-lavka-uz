import mongoose, { Schema, Model } from "mongoose";

export interface IPrint {
  name: string;
  image: string;
  category: "national" | "stylish" | "funny" | "all";
  active: boolean;
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
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["national", "stylish", "funny", "all"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Print =
  (mongoose.models.Print as Model<IPrint>) ||
  mongoose.model<IPrint>("Print", PrintSchema);

export default Print;
