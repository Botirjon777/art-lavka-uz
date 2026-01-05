import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  model: string; // Path to 3D model file
  colors: string[]; // Available colors
  sizes: string[]; // Available sizes
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["women", "men", "kids"],
    },
    image: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    colors: {
      type: [String],
      required: true,
      default: [],
    },
    sizes: {
      type: [String],
      required: true,
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
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

const Product =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
