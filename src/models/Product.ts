import mongoose, { Schema, Model } from "mongoose";

export interface ProductInventory {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface ProductVariant {
  size: string;
  price: number;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  variants: ProductVariant[];
}

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  model: string; // Path to 3D model file
  colors: ProductColor[]; // Available colors with variants
  sizes: string[]; // Available sizes
  stock: number; // Total stock
  active: boolean;
  featured?: boolean;
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
      default: "",
    },
    colors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
          variants: [
            {
              size: { type: String, required: true },
              price: { type: Number, required: true, min: 0 },
              stock: { type: Number, required: true, min: 0 },
            },
          ],
        },
      ],
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
    featured: {
      type: Boolean,
      default: false,
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
