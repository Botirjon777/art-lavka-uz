import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import dbConnect from "../src/lib/mongodb";
import Print from "../src/models/Print";

async function seedPrints() {
  try {
    await dbConnect();

    // Check if prints already exist
    const existingPrints = await Print.countDocuments();

    if (existingPrints > 0) {
      console.log(`${existingPrints} print(s) already exist in database.`);
      console.log(
        "Skipping seed. Delete existing prints first if you want to re-seed."
      );
      process.exit(0);
    }

    // Create 10 initial prints
    const prints = [
      {
        name: "Принт 1",
        image: "/prints/print-1.png",
        category: "national",
        active: true,
      },
      {
        name: "Принт 2",
        image: "/prints/print-2.png",
        category: "stylish",
        active: true,
      },
      {
        name: "Принт 3",
        image: "/prints/print-3.png",
        category: "funny",
        active: true,
      },
      {
        name: "Принт 4",
        image: "/prints/print-4.png",
        category: "national",
        active: true,
      },
      {
        name: "Принт 5",
        image: "/prints/print-5.png",
        category: "stylish",
        active: true,
      },
      {
        name: "Принт 6",
        image: "/prints/print-6.png",
        category: "funny",
        active: true,
      },
      {
        name: "Принт 7",
        image: "/prints/print-7.png",
        category: "national",
        active: true,
      },
      {
        name: "Принт 8",
        image: "/prints/print-8.png",
        category: "stylish",
        active: true,
      },
      {
        name: "Принт 9",
        image: "/prints/print-9.png",
        category: "funny",
        active: true,
      },
      {
        name: "Принт 10",
        image: "/prints/print-10.png",
        category: "all",
        active: true,
      },
    ];

    const createdPrints = await Print.insertMany(prints);

    console.log(`✅ ${createdPrints.length} prints seeded successfully!`);
    console.log("\nPrints by category:");
    const categories = ["national", "stylish", "funny", "all"];
    for (const category of categories) {
      const count = createdPrints.filter((p) => p.category === category).length;
      console.log(`  - ${category}: ${count} print(s)`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding prints:", error);
    process.exit(1);
  }
}

seedPrints();
