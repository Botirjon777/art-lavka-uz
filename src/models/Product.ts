import mongoose, { Schema, Model } from "mongoose";

export interface ProductInventory {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  model: string; // Path to 3D model file
  colors: string[]; // Available colors
  sizes: string[]; // Available sizes
  stock: number; // Total stock (calculated from inventory)
  inventory: ProductInventory; // Stock per size
  active: boolean;
  featured?: boolean; // Featured/new product
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
    inventory: {
      type: {
        XS: { type: Number, default: 0, min: 0 },
        S: { type: Number, default: 0, min: 0 },
        M: { type: Number, default: 0, min: 0 },
        L: { type: Number, default: 0, min: 0 },
        XL: { type: Number, default: 0, min: 0 },
        XXL: { type: Number, default: 0, min: 0 },
      },
      default: {
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
      },
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
