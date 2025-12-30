import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongodb";
import Admin from "../src/models/Admin";

async function seedAdmin() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@artlavka.uz" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    // Create admin user
    const admin = await Admin.create({
      email: "admin@artlavka.uz",
      password: "admin123", // Will be hashed automatically
      name: "Admin User",
      role: "super_admin",
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@artlavka.uz");
    console.log("Password: admin123");
    console.log("\nPlease change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
