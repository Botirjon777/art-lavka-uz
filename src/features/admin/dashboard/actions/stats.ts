"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Print from "@/models/Print";
import Gallery from "@/models/Gallery";

export async function getAdminStats() {
  try {
    await dbConnect();

    const [productCount, printCount, galleryCount] = await Promise.all([
      Product.countDocuments({}),
      Print.countDocuments({}),
      Gallery.countDocuments({}),
    ]);

    return {
      success: true,
      stats: {
        products: productCount,
        prints: printCount,
        gallery: galleryCount,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
    };
  }
}
