import { config } from "dotenv";
import { resolve, parse } from "path";
import fs from "fs";

// Load .env file (handled by tsx --env-file in package.json, but kept for direct runs)
config({ path: resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/mongodb";
import Print from "../src/models/Print";

async function migratePrintsToWebP() {
  console.log("🚀 Starting Database Migration to WebP Prints (with Name Fix)...");

  try {
    await dbConnect();
    console.log("📡 Connected to MongoDB.");

    const prints = await Print.find({});
    console.log(`🔍 Found ${prints.length} prints to check.`);

    let updatedCount = 0;
    let totalCount = prints.length;

    for (const print of prints) {
      let isUpdated = false;

      // Helper to transform URL/Path to local compressed webp
      const transformToWebP = (currentPath: string | undefined): string | undefined => {
        if (!currentPath) return currentPath;
        
        // Extract filename from URL or path
        let filename = currentPath.split("/").pop() || "";
        
        // IMPORTANT: Strip timestamp prefix (e.g., 1767692812899-)
        // These are added by the upload utility but standard prints in public/prints don't have them
        const cleanFilename = filename.replace(/^\d+-/, "");
        
        const nameWithoutExt = parse(cleanFilename).name;

        if (!nameWithoutExt) return currentPath;

        const newPath = `/prints/compressed/${nameWithoutExt}.webp`;
        
        return newPath;
      };

      const newFront = transformToWebP(print.frontImage);
      const newBack = transformToWebP(print.backImage);

      if (newFront !== print.frontImage) {
        print.frontImage = newFront!;
        isUpdated = true;
      }

      if (newBack !== print.backImage) {
        print.backImage = newBack;
        isUpdated = true;
      }

      if (isUpdated) {
        await print.save();
        console.log(`✅ Updated: ${print.name}`);
        console.log(`   - Was: ${newFront?.split('/').pop()} (and back)`);
        updatedCount++;
      }
    }

    console.log("-----------------------------------------");
    console.log(`🏁 Migration Complete!`);
    console.log(`✨ Updated: ${updatedCount} prints`);
    console.log(`⏭️  Checked: ${totalCount} prints total`);
    console.log("-----------------------------------------");
    console.log("💡 The numeric prefixes have been stripped to match the local files in public/prints/compressed/");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

migratePrintsToWebP();
