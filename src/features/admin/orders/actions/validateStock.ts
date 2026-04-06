"use server";

import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function validateStock(
  items: Array<{
    productId: string;
    color: string;
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
      color: string;
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

      // Find the color variant
      const colorData = product.colors?.find((c: any) => c.name === item.color);
      if (!colorData) {
        validationErrors.push(`${product.name} (Color: ${item.color}) - This color is not available.`);
        continue;
      }

      const variant = colorData.variants?.find((v: any) => v.size === item.size);
      const availableStock = variant ? variant.stock : 0;

      if (availableStock < item.quantity) {
        validationErrors.push(
          `${product.name} (${item.color}, Size: ${item.size}) - Only ${availableStock} available, you requested ${item.quantity}`
        );
      } else {
        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          color: item.color,
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
    color: string;
    size: string;
    quantity: number;
  }>
) {
  try {
    await dbConnect();

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const newColors = [...(product.colors || [])];
      const colorIdx = newColors.findIndex((c: any) => c.name === item.color);
      if (colorIdx === -1) continue;

      if (!newColors[colorIdx].variants) continue;
      const variantIdx = newColors[colorIdx].variants.findIndex((v: any) => v.size === item.size);
      if (variantIdx === -1) continue;

      const currentStock = newColors[colorIdx].variants[variantIdx].stock;
      const newStock = Math.max(0, currentStock - item.quantity);
      const stockDiff = currentStock - newStock;

      newColors[colorIdx].variants[variantIdx].stock = newStock;

      await Product.findByIdAndUpdate(
        item.productId,
        {
          $set: { colors: newColors },
          $inc: { stock: -stockDiff },
        }
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
