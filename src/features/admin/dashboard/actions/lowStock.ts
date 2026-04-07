"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getLowStockProducts(threshold: number = 5) {
  try {
    console.log("📊 [LOW STOCK] Fetching low stock products...");
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

    console.log(`✅ [LOW STOCK] Found ${lowStockItems.length} low stock items`);

    return {
      success: true,
      lowStockItems,
    };
  } catch (error: any) {
    console.error("❌ [LOW STOCK] Error fetching low stock products:", error);
    return {
      success: false,
      error: "Failed to fetch low stock products",
      lowStockItems: [],
    };
  }
}
