import { resolve } from "path";

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

    // Create some initial prints from optimized local WebP
    const prints = [
      {
        name: "Bear Ultra",
        frontImage: "/prints/compressed/bear-ultra.webp",
        category: "stylish",
        active: true,
      },
      {
        name: "Mickey Mouse",
        frontImage: "/prints/compressed/mickey-ultra.webp",
        category: "stylish",
        active: true,
      },
      {
        name: "Garfield",
        frontImage: "/prints/compressed/garfield-ultra.webp",
        category: "funny",
        active: true,
      },
      {
        name: "Uzbek Pattern",
        frontImage: "/prints/compressed/uzbek-national-front.webp",
        backImage: "/prints/compressed/uzbek-national-back.webp",
        category: "national",
        active: true,
      },
      {
        name: "Funny Cat",
        frontImage: "/prints/compressed/cat-front.webp",
        backImage: "/prints/compressed/cat-back.webp",
        category: "funny",
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
