import mongoose, { Schema, Model } from "mongoose";

export interface ISettings {
  categoryStatuses: {
    women: "active" | "soon";
    men: "active" | "soon";
    kids: "active" | "soon";
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    categoryStatuses: {
      women: {
        type: String,
        enum: ["active", "soon"],
        default: "active",
      },
      men: {
        type: String,
        enum: ["active", "soon"],
        default: "soon",
      },
      kids: {
        type: String,
        enum: ["active", "soon"],
        default: "soon",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Settings =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
