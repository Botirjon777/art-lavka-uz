"use server";

import { uploadToStorage, UploadResult } from "@/lib/upload";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Server action to handle file uploads
 */
export async function uploadFileAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "art-lavka/uploads";
  const withPreview = formData.get("withPreview") === "true";

  if (!file) {
    return { success: false, error: "Файл не выбран" };
  }

  return await uploadToStorage(file, folder, withPreview);
}
