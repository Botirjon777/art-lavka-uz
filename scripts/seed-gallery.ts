import { config } from "dotenv";
import { resolve } from "path";

// Load .env or .env.local file
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/mongodb";
import Gallery from "../src/models/Gallery";

// Gallery images data
const galleryImages = [
  {
    name: "Футболка овер сайз 1",
    image: "/products/tshirt-white-classic-1.png",
  },
  {
    name: "Футболка овер сайз 2",
    image: "/products/tshirt-white-classic-2.png",
  },
  {
    name: "Футболка овер сайз 3",
    image: "/products/tshirt-white-classic-3.png",
  },
  {
    name: "Футболка овер сайз 4",
    image: "/products/tshirt-white-classic-4.png",
  },
  {
    name: "Футболка овер сайз 5",
    image: "/products/tshirt-white-classic-5.png",
  },
  {
    name: "Футболка овер сайз 6",
    image: "/products/tshirt-white-classic-6.png",
  },
  {
    name: "Футболка овер сайз 7",
    image: "/products/tshirt-white-classic-7.png",
  },
  {
    name: "Футболка овер сайз 8",
    image: "/products/tshirt-white-classic-8.png",
  },
  {
    name: "Футболка овер сайз 9",
    image: "/products/tshirt-white-classic-9.png",
  },
  {
    name: "Футболка овер сайз 10",
    image: "/products/tshirt-white-classic-10.png",
  },
];

async function seedGallery() {
  try {
    await dbConnect();

    // Check if gallery already has data
    const existingCount = await Gallery.countDocuments();

    if (existingCount > 0) {
      console.log(
        `${existingCount} gallery image(s) already exist in database.`
      );
      console.log(
        "Skipping seed. Delete existing gallery images first if you want to re-seed."
      );
      process.exit(0);
    }

    // Insert gallery images
    const result = await Gallery.insertMany(galleryImages);

    console.log(`✅ ${result.length} gallery images seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding gallery:", error);
    process.exit(1);
  }
}

seedGallery();
