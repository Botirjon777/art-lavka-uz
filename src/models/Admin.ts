import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin {
  email: string;
  password: string;
  name: string;
  role: "admin" | "super_admin";
  createdAt: Date;
  updatedAt: Date;
}

interface IAdminMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type AdminModel = Model<IAdmin, {}, IAdminMethods>;

const AdminSchema = new Schema<IAdmin, AdminModel, IAdminMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin =
  (mongoose.models.Admin as AdminModel) ||
  mongoose.model<IAdmin, AdminModel>("Admin", AdminSchema);

export default Admin;
