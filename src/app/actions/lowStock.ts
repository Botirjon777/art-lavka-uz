"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function getLowStockProducts(threshold: number = 5) {
  try {
    await dbConnect();

    const products = await Product.find({ active: true }).lean();

    const lowStockItems: Array<{
      productId: string;
      productName: string;
      allSizes: Record<string, number>;
      hasLowStock: boolean;
    }> = [];

    products.forEach((product) => {
      const allSizes: Record<string, number> = {
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
      };

      let hasLowStock = false;

      if (product.inventory) {
        Object.entries(product.inventory).forEach(([size, quantity]) => {
          const qty = Number(quantity);
          allSizes[size] = qty;

          if (qty <= threshold) {
            hasLowStock = true;
          }
        });
      }

      if (hasLowStock) {
        lowStockItems.push({
          productId: product._id?.toString() || "",
          productName: product.name,
          allSizes,
          hasLowStock,
        });
      }
    });

    return {
      success: true,
      lowStockItems,
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
