"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { broadcastPromoNotification } from "@/lib/telegram/notifications";

export async function getProducts() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) {
      return null;
    }
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();

    const colors = JSON.parse((formData.get("colors") as string) || "[]");

    // Calculate total stock and derive available sizes from variants
    const availableSizesSet = new Set<string>();
    let totalStock = 0;
    
    colors.forEach((color: any) => {
      if (color.variants) {
        color.variants.forEach((v: any) => {
          totalStock += Number(v.stock) || 0;
          if (v.stock > 0) {
            availableSizesSet.add(v.size);
          }
        });
      }
    });

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      model: formData.get("model") as string,
      colors: colors,
      sizes: Array.from(availableSizesSet),
      stock: totalStock,
      active: formData.get("active") === "true",
      sizeTable: JSON.parse((formData.get("sizeTable") as string) || "[]"),
      oldPrice: Number(formData.get("oldPrice")) || 0,
      promoPrice: Number(formData.get("promoPrice")) || 0,
    };

    // Logic: Active price is promoPrice if exists, otherwise oldPrice
    if (productData.promoPrice && productData.promoPrice > 0) {
      productData.price = productData.promoPrice;
    } else {
      productData.price = productData.oldPrice;
    }

    // Use minimum variant price if provided price is invalid
    if (!productData.price || isNaN(productData.price)) {
      let minPrice = Infinity;
      colors.forEach((c: any) => {
        c.variants?.forEach((v: any) => {
          if (v.price && v.price < minPrice) minPrice = v.price;
        });
      });
      if (minPrice !== Infinity) productData.price = minPrice;
    }

    const product = await Product.create(productData);
    
    revalidatePath("/admin/products");
    return { success: true, product: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await dbConnect();

    const colors = JSON.parse((formData.get("colors") as string) || "[]");

    // Calculate total stock and derive available sizes from variants
    const availableSizesSet = new Set<string>();
    let totalStock = 0;
    
    colors.forEach((color: any) => {
      if (color.variants) {
        color.variants.forEach((v: any) => {
          totalStock += Number(v.stock) || 0;
          if (v.stock > 0) {
            availableSizesSet.add(v.size);
          }
        });
      }
    });

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      model: formData.get("model") as string,
      colors: colors,
      sizes: Array.from(availableSizesSet),
      stock: totalStock,
      active: formData.get("active") === "true",
      sizeTable: JSON.parse((formData.get("sizeTable") as string) || "[]"),
      oldPrice: Number(formData.get("oldPrice")) || 0,
      promoPrice: Number(formData.get("promoPrice")) || 0,
    };

    // Logic: Active price is promoPrice if exists, otherwise oldPrice
    if (productData.promoPrice && productData.promoPrice > 0) {
      productData.price = productData.promoPrice;
    } else {
      productData.price = productData.oldPrice;
    }

    // Use minimum variant price if provided price is invalid
    if (!productData.price || isNaN(productData.price)) {
      let minPrice = Infinity;
      colors.forEach((c: any) => {
        c.variants?.forEach((v: any) => {
          if (v.price && v.price < minPrice) minPrice = v.price;
        });
      });
      if (minPrice !== Infinity) productData.price = minPrice;
    }

    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    revalidatePath("/admin/products");
    return { success: true, product: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
}

export async function broadcastProductPromo(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id);
    
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Check 24-hour limit
    if (product.lastPromoSentAt) {
      const now = new Date();
      const lastSent = new Date(product.lastPromoSentAt);
      const diffMs = now.getTime() - lastSent.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        return { 
          success: false, 
          error: `Вы уже отправляли рассылку для этого товара. Пожалуйста, подождите ${remainingHours} ч.` 
        };
      }
    }

    // Send notification
    await broadcastPromoNotification(JSON.parse(JSON.stringify(product)));

    // Update last sent time using findByIdAndUpdate to avoid triggering 
    // full document validation on potentially inconsistent data fields.
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { lastPromoSentAt: new Date() },
      { new: true }
    );

    if (!updatedProduct) {
      return { success: false, error: "Failed to update broadcast timestamp" };
    }

    revalidatePath("/admin/products");
    return { success: true, lastPromoSentAt: updatedProduct.lastPromoSentAt };
  } catch (error: any) {
    console.error("Error in broadcastProductPromo:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
}
