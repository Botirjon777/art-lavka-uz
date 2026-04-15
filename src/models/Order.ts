import mongoose, { Schema, Model } from "mongoose";

export interface IOrder {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  region: string;
  village: string;
  customerAddress: string;
  items: {
    product: {
      _id: string;
      name: string;
      image: string;
      model?: string;
      category?: string;
    };
    print: {
      _id: string;
      name: string;
      frontImage: string;
      backImage?: string;
    } | null;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: "cash" | "payme" | "click";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    village: {
      type: String,
      required: true,
      trim: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        product: {
          _id: { type: String, required: true },
          name: { type: String, required: true },
          image: { type: String, required: true },
          model: { type: String },
          category: { type: String },
        },
        print: {
          _id: { type: String },
          name: { type: String },
          frontImage: { type: String },
          backImage: { type: String },
        },
        color: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "payme", "click"],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).Order;
}

const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
