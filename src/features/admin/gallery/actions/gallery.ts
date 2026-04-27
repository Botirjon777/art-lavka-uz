"use server";

import dbConnect from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { revalidatePath } from "next/cache";

export async function getGalleries() {
  try {
    await dbConnect();
    const galleries = await Gallery.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(galleries));
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }
}

export async function getGalleryById(id: string) {
  try {
    await dbConnect();
    const gallery = await Gallery.findById(id).lean();
    if (!gallery) return null;
    return JSON.parse(JSON.stringify(gallery));
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return null;
  }
}

export async function createGallery(formData: FormData) {
  try {
    await dbConnect();

    const galleryData = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      productId: formData.get("productId") || undefined,
    };

    const gallery = await Gallery.create(galleryData);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/", "page");

    return { success: true, data: JSON.parse(JSON.stringify(gallery)) };
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return { success: false, error: "Failed to create gallery image" };
  }
}

export async function updateGallery(id: string, formData: FormData) {
  try {
    await dbConnect();

    const galleryData = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      productId: formData.get("productId") || undefined,
    };

    const gallery = await Gallery.findByIdAndUpdate(id, galleryData, {
      new: true,
    });

    if (!gallery) {
      return { success: false, error: "Gallery image not found" };
    }

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/", "page");

    return { success: true, data: JSON.parse(JSON.stringify(gallery)) };
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return { success: false, error: "Failed to update gallery image" };
  }
}

export async function deleteGallery(id: string) {
  try {
    await dbConnect();
    const result = await Gallery.findByIdAndDelete(id);

    if (!result) {
      return { success: false, error: "Gallery image not found" };
    }

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/", "page");

    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return { success: false, error: "Failed to delete gallery image" };
  }
}
