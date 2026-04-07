"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Print from "@/models/Print";
import Gallery from "@/models/Gallery";

export async function getAdminStats() {
  try {
    console.log("📊 [STATS] Fetching admin stats...");
    await dbConnect();

    const [productCount, printCount, galleryCount] = await Promise.all([
      Product.countDocuments({}),
      Print.countDocuments({}),
      Gallery.countDocuments({}),
    ]);

    console.log("✅ [STATS] Stats fetched successfully");

    return {
      success: true,
      stats: {
        products: productCount,
        prints: printCount,
        gallery: galleryCount,
      },
    };
  } catch (error) {
    console.error("❌ [STATS] Error fetching admin stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
    };
  }
}
