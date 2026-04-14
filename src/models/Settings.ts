import mongoose, { Schema, Model } from "mongoose";

export interface ICategory {
  id: string; // internal slug (e.g. 'women')
  label: string; // display name (e.g. 'Женский')
  status: "active" | "soon";
}

export interface ISettings {
  categories: ICategory[];
  menu: {
    delivery: string;
    payment: string;
    about: string;
    telegram: string;
    email: string;
    instagramArtists: string;
    instagramStore: string;
  };
  // Maintain backward compatibility during transition if needed
  categoryStatuses?: {
    [key: string]: "active" | "soon";
  };
}

const CategorySchema = new Schema<ICategory>({
  id: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ["active", "soon"], default: "active" },
});

const SettingsSchema = new Schema<ISettings>(
  {
    categories: [CategorySchema],
    menu: {
      delivery: { type: String, default: "" },
      payment: { type: String, default: "" },
      about: { type: String, default: "" },
      telegram: { type: String, default: "" },
      email: { type: String, default: "" },
      instagramArtists: { type: String, default: "" },
      instagramStore: { type: String, default: "" },
    },
    // Legacy support
    categoryStatuses: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Force reload of model in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Settings;
}

const Settings =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
