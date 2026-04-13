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

    // Create some initial prints from Cloudinary
    const prints = [
      {
        name: "Bear Ultra",
        frontImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078229/art-lavka/prints/bear-ultra.png",
        category: "stylish",
        active: true,
      },
      {
        name: "Mickey Mouse",
        frontImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078255/art-lavka/prints/mickey-ultra.png",
        category: "stylish",
        active: true,
      },
      {
        name: "Garfield",
        frontImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078246/art-lavka/prints/garfield-ultra.png",
        category: "funny",
        active: true,
      },
      {
        name: "Uzbek Pattern",
        frontImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078286/art-lavka/prints/uzbek-national-front.jpg",
        backImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078277/art-lavka/prints/uzbek-national-back.jpg",
        category: "national",
        active: true,
      },
      {
        name: "Funny Cat",
        frontImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078234/art-lavka/prints/cat-front.jpg",
        backImage: "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078232/art-lavka/prints/cat-back.jpg",
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
