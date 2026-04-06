"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { unstable_cache } from "next/cache";

const fetchLowStockProducts = async (threshold: number = 5) => {
  await dbConnect();

  const products = await Product.find({ active: true }).lean();

  const lowStockItems: Array<{
    productId: string;
    productName: string;
    allSizes: Record<string, number>;
    hasLowStock: boolean;
  }> = [];

  (products as any[]).forEach((product: any) => {
    const allSizes: Record<string, number> = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
    };

    let hasLowStockTotal = false;

    if (product.colors) {
      product.colors.forEach((color: any) => {
        color.variants?.forEach((v: any) => {
          const qty = Number(v.stock) || 0;
          allSizes[v.size] = (allSizes[v.size] || 0) + qty;
          if (qty <= threshold) {
            hasLowStockTotal = true;
          }
        });
      });
    }

    if (hasLowStockTotal) {
      lowStockItems.push({
        productId: product._id?.toString() || "",
        productName: product.name,
        allSizes,
        hasLowStock: hasLowStockTotal,
      });
    }
  });

  return lowStockItems;
};

const getCachedLowStockProducts = unstable_cache(
  async (threshold: number) => fetchLowStockProducts(threshold),
  ["low-stock-products"],
  { revalidate: 300, tags: ["low-stock"] }
);

export async function getLowStockProducts(threshold: number = 5) {
  try {
    const items = await getCachedLowStockProducts(threshold);

    return {
      success: true,
      lowStockItems: items,
    };
  } catch (error: any) {
    console.error("Error fetching low stock products:", error);
    return {
      success: false,
      error: "Failed to fetch low stock products",
      lowStockItems: [],
    };
  }
}
