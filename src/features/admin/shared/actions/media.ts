"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Print from "@/models/Print";
import Gallery from "@/models/Gallery";
import Publication from "@/models/Publication";

export interface MediaItem {
  url: string;
  source: string;
  name?: string;
  createdAt: string;
}

/**
 * Aggregates all unique images from across the platform to create a "Media Library" history.
 */
export async function getMediaHistory(): Promise<{ success: boolean; data?: MediaItem[]; error?: string }> {
  try {
    await dbConnect();

    // Fetch from all major sources
    const [products, prints, gallery, publications] = await Promise.all([
      Product.find({}, "image name createdAt"),
      Print.find({}, "frontImage backImage name createdAt"),
      Gallery.find({}, "image name createdAt"),
      Publication.find({}, "image title createdAt"),
    ]);

    const mediaMap = new Map<string, MediaItem>();

    // Process Gallery (primary source)
    gallery.forEach((g) => {
      if (g.image) {
        mediaMap.set(g.image, {
          url: g.image,
          source: "Галерея",
          name: g.name,
          createdAt: g.createdAt?.toISOString(),
        });
      }
    });

    // Process Products
    products.forEach((p) => {
      if (p.image && !mediaMap.has(p.image)) {
        mediaMap.set(p.image, {
          url: p.image,
          source: "Товары",
          name: p.name,
          createdAt: p.createdAt?.toISOString(),
        });
      }
    });

    // Process Prints
    prints.forEach((pr) => {
      if (pr.frontImage && !mediaMap.has(pr.frontImage)) {
        mediaMap.set(pr.frontImage, {
          url: pr.frontImage,
          source: "Принты",
          name: pr.name,
          createdAt: pr.createdAt?.toISOString(),
        });
      }
      if (pr.backImage && !mediaMap.has(pr.backImage)) {
        mediaMap.set(pr.backImage, {
          url: pr.backImage,
          source: "Принты (Сзади)",
          name: pr.name,
          createdAt: pr.createdAt?.toISOString(),
        });
      }
    });

    // Process Publications
    publications.forEach((pub) => {
      if (pub.image && !mediaMap.has(pub.image)) {
        mediaMap.set(pub.image, {
          url: pub.image,
          source: "Публикации",
          name: pub.title,
          createdAt: pub.createdAt?.toISOString(),
        });
      }
    });

    // Sort by most recently created
    const sortedMedia = Array.from(mediaMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { success: true, data: sortedMedia };
  } catch (error: any) {
    console.error("Error fetching media history:", error);
    return { success: false, error: error.message };
  }
}
