import { config } from "dotenv";
import { resolve, join, basename } from "path";
import { readdirSync, existsSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config({ path: resolve(process.cwd(), ".env.local") });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const foldersToUpload = [
  { local: "public/products", cloud: "art-lavka/products" },
  { local: "public/prints", cloud: "art-lavka/prints" },
  { local: "public/gallery", cloud: "art-lavka/gallery" },
];

async function uploadImages() {
  console.log("🚀 Starting Cloudinary upload process...");
  
  const results: Record<string, string> = {};
  let totalUploaded = 0;

  for (const folder of foldersToUpload) {
    const localDirPath = resolve(process.cwd(), folder.local);
    
    if (!existsSync(localDirPath)) {
      console.log(`⚠️  Folder not found: ${folder.local}, skipping...`);
      continue;
    }

    console.log(`📁 Scanning ${folder.local}...`);
    const files = readdirSync(localDirPath).filter(file => 
      /\.(png|jpe?g|webp|gif|svg)$/i.test(file)
    );

    for (const file of files) {
      const filePath = join(localDirPath, file);
      const publicId = basename(file, "." + file.split(".").pop());
      const relativePath = `/${folder.local.replace("public/", "")}/${file}`;

      try {
        console.log(`📤 Uploading ${file} to ${folder.cloud}...`);
        
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: folder.cloud,
          public_id: publicId,
          overwrite: true,
          resource_type: "auto",
        });

        results[relativePath] = uploadResult.secure_url;
        totalUploaded++;
        console.log(`✅ Success: ${uploadResult.secure_url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error);
      }
    }
  }

  console.log("\n--- UPLOAD SUMMARY ---");
  console.log(`Total images uploaded: ${totalUploaded}`);
  console.log("\nMapping (Copy this for your seed files):");
  console.log(JSON.stringify(results, null, 2));
  
  console.log("\n🚀 Done!");
}

uploadImages();
