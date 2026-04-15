import fs from "fs";
import path from "path";
import sharp from "sharp";

const PRINTS_DIR = path.join(process.cwd(), "public", "prints");
const COMPRESSED_DIR = path.join(PRINTS_DIR, "compressed");

async function optimizeImages() {
  console.log("🚀 Starting Reorganized Print Optimization...");

  if (!fs.existsSync(PRINTS_DIR)) {
    console.error(`❌ Directory not found: ${PRINTS_DIR}`);
    process.exit(1);
  }

  // Ensure compressed directory exists
  if (!fs.existsSync(COMPRESSED_DIR)) {
    console.log(`📁 Creating directory: ${COMPRESSED_DIR}`);
    fs.mkdirSync(COMPRESSED_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PRINTS_DIR);
  const imageFiles = files.filter((file) =>
    [".png", ".jpg", ".jpeg"].includes(path.extname(file).toLowerCase())
  );

  console.log(`🔍 Found ${imageFiles.length} images to process.\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;

  for (const file of imageFiles) {
    const filePath = path.join(PRINTS_DIR, file);
    const fileName = path.parse(file).name;
    const outputFileName = `${fileName}.webp`;
    const outputPath = path.join(COMPRESSED_DIR, outputFileName);

    try {
      const stats = fs.statSync(filePath);
      totalOriginalSize += stats.size;

      await sharp(filePath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      totalOptimizedSize += optimizedStats.size;

      const saving = (((stats.size - optimizedStats.size) / stats.size) * 100).toFixed(1);
      
      console.log(`✅ Processed: ${file}`);
      console.log(`   - Original:  ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   - Optimized: ${(optimizedStats.size / 1024 / 1024).toFixed(2)} MB (${saving}% saved)`);
      console.log(`   - Saved to:  prints/compressed/${outputFileName}\n`);
      
      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  const totalSaved = totalOriginalSize - totalOptimizedSize;
  const totalSavingPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1);

  console.log("-----------------------------------------");
  console.log(`🏁 Optimization Complete!`);
  console.log(`📦 Processed:        ${processedCount} files`);
  console.log(`📁 Output Folder:    public/prints/compressed`);
  console.log(`📉 Total Saved:      ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Overall Savings:  ${totalSavingPercent}%`);
  console.log("-----------------------------------------");
  console.log("\n💡 Note: Original files in public/prints were kept as backups.");
}

optimizeImages().catch((err) => {
  console.error("💥 Fatal error during optimization:", err);
  process.exit(1);
});
