import mongoose, { Schema, Document } from "mongoose";

export interface IOffice extends Document {
  region: string;
  district: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeSchema: Schema = new Schema(
  {
    region: { type: String, required: true },
    district: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Office || mongoose.model<IOffice>("Office", OfficeSchema);
