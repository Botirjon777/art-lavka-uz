import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongodb";
import Product from "../src/models/Product";

async function seedProducts() {
  try {
    await dbConnect();

    // Check if products already exist
    const existingProducts = await Product.countDocuments();

    if (existingProducts > 0) {
      console.log(`${existingProducts} product(s) already exist in database.`);
      console.log(
        "Skipping seed. Delete existing products first if you want to re-seed."
      );
      process.exit(0);
    }

    // Create initial product
    const product = await Product.create({
      name: "Футболка овер сайз",
      description:
        "Стильная женская футболка оверсайз с возможностью нанесения принта",
      price: 100000,
      category: "women",
      image: "/products/tshirt-white-classic-1.png",
      model: "/model/compressed/base.glb",
      colors: [
        { name: "white", hex: "#FFFFFF" },
        { name: "black", hex: "#000000" },
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 100,
      active: true,
    });

    console.log("✅ Product seeded successfully!");
    console.log("Product details:");
    console.log(`  - Name: ${product.name}`);
    console.log(`  - Category: ${product.category}`);
    console.log(`  - Price: ${product.price} сум`);
    console.log(
      `  - Colors: ${product.colors.map((c: any) => c.name).join(", ")}`
    );
    console.log(`  - Sizes: ${product.sizes.join(", ")}`);
    console.log(`  - Model: ${product.model}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
