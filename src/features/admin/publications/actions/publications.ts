"use server";

import dbConnect from "@/lib/mongodb";
import Publication from "@/models/Publication";
import { revalidatePath } from "next/cache";

export async function getPublications() {
  try {
    await dbConnect();
    const publications = await Publication.find({}).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(publications)) };
  } catch (error: any) {
    console.error("Error fetching publications:", error);
    return { success: false, error: error.message };
  }
}

export async function getPublicationById(id: string) {
  try {
    await dbConnect();
    const publication = await Publication.findById(id);
    if (!publication) return { success: false, error: "Publication not found" };
    return { success: true, data: JSON.parse(JSON.stringify(publication)) };
  } catch (error: any) {
    console.error("Error fetching publication:", error);
    return { success: false, error: error.message };
  }
}

export async function createPublication(formData: FormData) {
  try {
    await dbConnect();
    
    const publicationData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      image: formData.get("image") as string,
      targetUrl: formData.get("targetUrl") as string,
      isActive: formData.get("isActive") === "true",
      type: formData.get("type") as string,
    };

    const publication = await Publication.create(publicationData);
    
    revalidatePath("/admin/publications");
    return { success: true, data: JSON.parse(JSON.stringify(publication)) };
  } catch (error: any) {
    console.error("Error creating publication:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePublication(id: string, formData: FormData) {
  try {
    await dbConnect();
    
    const publicationData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      image: formData.get("image") as string,
      targetUrl: formData.get("targetUrl") as string,
      isActive: formData.get("isActive") === "true",
      type: formData.get("type") as string,
    };

    const publication = await Publication.findByIdAndUpdate(id, publicationData, { new: true });
    
    if (!publication) {
      return { success: false, error: "Publication not found" };
    }

    revalidatePath("/admin/publications");
    return { success: true, data: JSON.parse(JSON.stringify(publication)) };
  } catch (error: any) {
    console.error("Error updating publication:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePublication(id: string) {
  try {
    await dbConnect();
    await Publication.findByIdAndDelete(id);
    revalidatePath("/admin/publications");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting publication:", error);
    return { success: false, error: error.message };
  }
}

export async function incrementPublicationView(id: string) {
  try {
    await dbConnect();
    await Publication.findByIdAndUpdate(id, { $inc: { views: 1 } });
    return { success: true };
  } catch (error: any) {
    console.error("Error incrementing view:", error);
    return { success: false, error: error.message };
  }
}

export async function broadcastPublicationToTelegram(id: string) {
  try {
    await dbConnect();
    const publication = await Publication.findById(id);
    
    if (!publication) {
      return { success: false, error: "Publication not found" };
    }

    // Lazy import bot and notification logic
    const { broadcastPublicationNotification } = await import("@/lib/telegram/notifications");
    
    await broadcastPublicationNotification(JSON.parse(JSON.stringify(publication)));
    
    // Update last broadcast time
    publication.lastBroadcastAt = new Date();
    await publication.save();

    revalidatePath("/admin/publications");
    return { success: true };
  } catch (error: any) {
    console.error("Error broadcasting publication:", error);
    return { success: false, error: error.message };
  }
}
