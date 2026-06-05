import mongoose, { Schema, Model } from "mongoose";

export interface IPaymeTransaction {
  paymeId: string;      // PayMe's own transaction ID
  orderNumber: string;  // our order number (ac.order_id)
  amount: number;       // in tiins (1 UZS = 100 tiins)
  state: number;        // 1=pending, 2=completed, -1=cancelled(pending), -2=cancelled(completed)
  createTime: number;   // unix ms (from PayMe)
  performTime: number;  // unix ms, 0 if not yet performed
  cancelTime: number;   // unix ms, 0 if not yet cancelled
  reason?: number;      // cancel reason code
}

const PaymeTransactionSchema = new Schema<IPaymeTransaction>(
  {
    paymeId: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    state: { type: Number, required: true, default: 1 },
    createTime: { type: Number, required: true },
    performTime: { type: Number, default: 0 },
    cancelTime: { type: Number, default: 0 },
    reason: { type: Number },
  },
  { timestamps: true }
);

PaymeTransactionSchema.index({ orderNumber: 1 });

if (process.env.NODE_ENV === "development") {
  delete (mongoose.models as any).PaymeTransaction;
}

const PaymeTransaction =
  (mongoose.models.PaymeTransaction as Model<IPaymeTransaction>) ||
  mongoose.model<IPaymeTransaction>("PaymeTransaction", PaymeTransactionSchema);

export default PaymeTransaction;
