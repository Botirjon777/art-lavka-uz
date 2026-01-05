import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  name: string;
  image: string;
  productId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery ||
  mongoose.model<IGallery>("Gallery", GallerySchema);
