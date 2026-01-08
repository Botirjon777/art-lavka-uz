"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function validateStock(
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>
) {
  try {
    await dbConnect();

    const validationErrors: string[] = [];
    const validatedItems: Array<{
      productId: string;
      productName: string;
      size: string;
      quantity: number;
      availableStock: number;
    }> = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        validationErrors.push(`Product not found (ID: ${item.productId})`);
        continue;
      }

      const availableStock =
        product.inventory?.[item.size as keyof typeof product.inventory] || 0;

      if (availableStock < item.quantity) {
        validationErrors.push(
          `${product.name} (Size: ${item.size}) - Only ${availableStock} available, you requested ${item.quantity}`
        );
      } else {
        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          size: item.size,
          quantity: item.quantity,
          availableStock,
        });
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
      };
    }

    return {
      success: true,
      validatedItems,
    };
  } catch (error: any) {
    console.error("Error validating stock:", error);
    return {
      success: false,
      errors: ["Failed to validate stock availability"],
    };
  }
}

export async function decrementStock(
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>
) {
  try {
    await dbConnect();

    for (const item of items) {
      // Fetch current product to check stock
      const product = await Product.findById(item.productId);

      if (!product) continue;

      const currentStock =
        product.inventory?.[item.size as keyof typeof product.inventory] || 0;
      const newStock = Math.max(0, currentStock - item.quantity);
      const stockDiff = currentStock - newStock;

      await Product.findByIdAndUpdate(
        item.productId,
        {
          $set: {
            [`inventory.${item.size}`]: newStock,
          },
          $inc: {
            stock: -stockDiff,
          },
        },
        { new: true }
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error decrementing stock:", error);
    return {
      success: false,
      error: "Failed to update stock",
    };
  }
}
