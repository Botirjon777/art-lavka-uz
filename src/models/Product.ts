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
  oldPrice?: number;
  promoPrice?: number;
  stock: number;
  hideExactStock?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  variants: ProductVariant[];
}

export interface SizeTableEntry {
  size: string;
  width: string;
  height: string;
}

export interface ProductTranslation {
  name: string;
  description?: string;
}

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  category: string;
  image: string;
  model: string; // Path to 3D model file
  colors: ProductColor[]; // Available colors with variants
  sizes: string[]; // Available sizes
  sizeTable?: SizeTableEntry[]; // Per-product size measurements
  stock: number; // Total stock
  active: boolean;
  isDefault?: boolean;
  featured?: boolean;
  lastPromoSentAt?: Date;
  weight?: number; // Weight in kg
  translations?: {
    en?: ProductTranslation;
    ru?: ProductTranslation;
    uz?: ProductTranslation;
  };
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
    oldPrice: {
      type: Number,
      min: 0,
    },
    promoPrice: {
      type: Number,
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
              oldPrice: { type: Number, min: 0 },
              promoPrice: { type: Number, min: 0 },
              stock: { type: Number, required: true, min: 0 },
              hideExactStock: { type: Boolean, default: false },
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
    sizeTable: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      default: 0.5, // Default 500g
      min: 0,
    },
    lastPromoSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Force reload of model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Product;
}

const Product =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
