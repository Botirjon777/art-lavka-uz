import fs from "fs";
import path from "path";
import sharp from "sharp";

const SIZES_DIR = path.join(process.cwd(), "public", "sizes");
const BACKUP_DIR = path.join(SIZES_DIR, "original");

async function optimizeSizes() {
  console.log("🚀 Starting Sizes Image Optimization...");

  if (!fs.existsSync(SIZES_DIR)) {
    console.error(`❌ Directory not found: ${SIZES_DIR}`);
    process.exit(1);
  }

  // Ensure backup directory exists for original files
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log(`📁 Creating backup directory: ${BACKUP_DIR}`);
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SIZES_DIR);
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    // Exclude directories and only select images
    const isImage = [".png", ".jpg", ".jpeg"].includes(ext);
    const isFile = fs.statSync(path.join(SIZES_DIR, file)).isFile();
    return isImage && isFile;
  });

  console.log(`🔍 Found ${imageFiles.length} images to process.\n`);

  if (imageFiles.length === 0) {
    console.log("ℹ️ No new images to process.");
    process.exit(0);
  }

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;

  for (const file of imageFiles) {
    const filePath = path.join(SIZES_DIR, file);
    const fileName = path.parse(file).name;
    const outputFileName = `${fileName}.webp`;
    const outputPath = path.join(SIZES_DIR, outputFileName);
    const backupPath = path.join(BACKUP_DIR, file);

    try {
      const stats = fs.statSync(filePath);
      totalOriginalSize += stats.size;

      console.log(`⏳ Processing: ${file}...`);
      await sharp(filePath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      totalOptimizedSize += optimizedStats.size;

      const saving = (((stats.size - optimizedStats.size) / stats.size) * 100).toFixed(1);
      
      console.log(`✅ Processed: ${file}`);
      console.log(`   - Original:  ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`   - Optimized: ${(optimizedStats.size / 1024).toFixed(1)} KB (${saving}% saved)`);
      console.log(`   - Saved to:  public/sizes/${outputFileName}`);
      
      // Move original file to the backup directory
      fs.renameSync(filePath, backupPath);
      console.log(`   - Moved original to: public/sizes/original/${file}\n`);
      
      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  const totalSaved = totalOriginalSize - totalOptimizedSize;
  const totalSavingPercent = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) : "0";

  console.log("-----------------------------------------");
  console.log(`🏁 Optimization Complete!`);
  console.log(`📦 Processed:        ${processedCount} files`);
  console.log(`📁 Output Folder:    public/sizes`);
  console.log(`📂 Original Backup:  public/sizes/original`);
  console.log(`📉 Total Saved:      ${(totalSaved / 1024).toFixed(1)} KB`);
  console.log(`📉 Overall Savings:  ${totalSavingPercent}%`);
  console.log("-----------------------------------------");
}

optimizeSizes().catch((err) => {
  console.error("💥 Fatal error during optimization:", err);
  process.exit(1);
});
