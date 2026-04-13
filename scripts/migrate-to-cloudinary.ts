import "dotenv/config";
import dbConnect from "../src/lib/mongodb";
import Product from "../src/models/Product";
import Print from "../src/models/Print";
import Gallery from "../src/models/Gallery";

const CLOUDINARY_MAPPING: Record<string, string> = {
  "/products/tshirt-white-classic-1.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078218/art-lavka/products/tshirt-white-classic-1.png",
  "/products/tshirt-white-classic-10.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078220/art-lavka/products/tshirt-white-classic-10.png",
  "/products/tshirt-white-classic-2.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078221/art-lavka/products/tshirt-white-classic-2.png",
  "/products/tshirt-white-classic-3.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078221/art-lavka/products/tshirt-white-classic-3.png",
  "/products/tshirt-white-classic-4.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078222/art-lavka/products/tshirt-white-classic-4.png",
  "/products/tshirt-white-classic-5.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078223/art-lavka/products/tshirt-white-classic-5.png",
  "/products/tshirt-white-classic-6.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078224/art-lavka/products/tshirt-white-classic-6.png",
  "/products/tshirt-white-classic-7.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078225/art-lavka/products/tshirt-white-classic-7.png",
  "/products/tshirt-white-classic-8.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078226/art-lavka/products/tshirt-white-classic-8.png",
  "/products/tshirt-white-classic-9.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078227/art-lavka/products/tshirt-white-classic-9.png",
  "/prints/bear-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078229/art-lavka/prints/bear-ultra.png",
  "/prints/cat-back-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078230/art-lavka/prints/cat-back-transparent.png",
  "/prints/cat-back.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078232/art-lavka/prints/cat-back.jpg",
  "/prints/cat-front-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078232/art-lavka/prints/cat-front-transparent.png",
  "/prints/cat-front.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078234/art-lavka/prints/cat-front.jpg",
  "/prints/cat-high.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078235/art-lavka/prints/cat-high.png",
  "/prints/cat-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078236/art-lavka/prints/cat-ultra.png",
  "/prints/fly-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078237/art-lavka/prints/fly-ultra.png",
  "/prints/funny-meme-back-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078238/art-lavka/prints/funny-meme-back-transparent.png",
  "/prints/funny-meme-back.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078240/art-lavka/prints/funny-meme-back.jpg",
  "/prints/funny-meme-front-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078241/art-lavka/prints/funny-meme-front-transparent.png",
  "/prints/funny-meme-front.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078242/art-lavka/prints/funny-meme-front.jpg",
  "/prints/garfield-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078246/art-lavka/prints/garfield-ultra.png",
  "/prints/lips-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078248/art-lavka/prints/lips-ultra.png",
  "/prints/mickey-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078255/art-lavka/prints/mickey-ultra.png",
  "/prints/rabbit-ultra.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078260/art-lavka/prints/rabbit-ultra.png",
  "/prints/stylish-modern-back-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078262/art-lavka/prints/stylish-modern-back-transparent.png",
  "/prints/stylish-modern-back.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078265/art-lavka/prints/stylish-modern-back.jpg",
  "/prints/stylish-modern-front-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078267/art-lavka/prints/stylish-modern-front-transparent.png",
  "/prints/stylish-modern-front.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078270/art-lavka/prints/stylish-modern-front.jpg",
  "/prints/uzbek-national-back-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078272/art-lavka/prints/uzbek-national-back-transparent.png",
  "/prints/uzbek-national-back.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078277/art-lavka/prints/uzbek-national-back.jpg",
  "/prints/uzbek-national-front-transparent.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078280/art-lavka/prints/uzbek-national-front-transparent.png",
  "/prints/uzbek-national-front.png": "https://res.cloudinary.com/dwmodrs7i/image/upload/v1776078286/art-lavka/prints/uzbek-national-front.jpg"
};

async function migrate() {
  try {
    console.log("🚀 Starting database migration to Cloudinary...");
    await dbConnect();

    // 1. Update Products
    const products = await Product.find({});
    let productUpdates = 0;
    for (const doc of products) {
      if (CLOUDINARY_MAPPING[doc.image]) {
        doc.image = CLOUDINARY_MAPPING[doc.image];
        await doc.save();
        productUpdates++;
      }
    }
    console.log(`✅ Updated ${productUpdates} products.`);

    // 2. Update Prints
    const prints = await Print.find({});
    let printUpdates = 0;
    for (const doc of prints) {
      let changed = false;
      if (CLOUDINARY_MAPPING[doc.frontImage]) {
        doc.frontImage = CLOUDINARY_MAPPING[doc.frontImage];
        changed = true;
      }
      if (doc.backImage && CLOUDINARY_MAPPING[doc.backImage]) {
        doc.backImage = CLOUDINARY_MAPPING[doc.backImage];
        changed = true;
      }
      if (changed) {
        await doc.save();
        printUpdates++;
      }
    }
    console.log(`✅ Updated ${printUpdates} prints.`);

    // 3. Update Gallery
    const galleryItems = await Gallery.find({});
    let galleryUpdates = 0;
    for (const doc of galleryItems) {
      if (CLOUDINARY_MAPPING[doc.image]) {
        doc.image = CLOUDINARY_MAPPING[doc.image];
        await doc.save();
        galleryUpdates++;
      }
    }
    console.log(`✅ Updated ${galleryUpdates} gallery items.`);

    console.log("\n🎊 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
