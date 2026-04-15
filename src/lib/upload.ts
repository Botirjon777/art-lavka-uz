import { writeFile, mkdir } from "fs/promises";
import { join, parse } from "path";
import { existsSync } from "fs";
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Shared utility to upload a file to Cloudinary or local storage
 */
export async function uploadToStorage(
  file: File,
  folder: string = "art-lavka/uploads"
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/heic",
      "image/heif",
      "image/avif",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: "Недопустимый тип файла. Разрешены только JPEG, PNG и WebP" 
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: "Файл слишком большой. Максимальный размер 5МБ" 
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Production: Upload to Cloudinary
    if (process.env.NODE_ENV === "production" || process.env.USE_CLOUDINARY === "true") {
      try {
        const uploadResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        const result = uploadResponse as any;
        return { 
          success: true, 
          url: result.secure_url 
        };
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return { success: false, error: "Ошибка загрузки в Cloudinary" };
      }
    }

    // Development: Save to public/uploads directory
    const timestamp = Date.now();
    const originalName = parse(file.name).name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}.webp`;
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return { success: true, url };
    
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Произошла ошибка при загрузке файла" };
  }
}
