"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Print from "@/models/Print";
import Gallery from "@/models/Gallery";
import { unstable_cache } from "next/cache";

const fetchAdminStats = async () => {
  await dbConnect();

  const [productCount, printCount, galleryCount] = await Promise.all([
    Product.countDocuments({}),
    Print.countDocuments({}),
    Gallery.countDocuments({}),
  ]);

  return {
    products: productCount,
    prints: printCount,
    gallery: galleryCount,
  };
};

const getCachedAdminStats = unstable_cache(
  async () => fetchAdminStats(),
  ["admin-stats"],
  { revalidate: 300, tags: ["admin-stats"] }
);

export async function getAdminStats() {
  try {
    const stats = await getCachedAdminStats();

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
    };
  }
}
