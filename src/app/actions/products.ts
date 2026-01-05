"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

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

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      model: formData.get("model") as string,
      colors: JSON.parse((formData.get("colors") as string) || "[]"),
      sizes: JSON.parse((formData.get("sizes") as string) || "[]"),
      stock: Number(formData.get("stock")) || 0,
      active: formData.get("active") === "true",
    };

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

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      image: formData.get("image") as string,
      model: formData.get("model") as string,
      colors: JSON.parse((formData.get("colors") as string) || "[]"),
      sizes: JSON.parse((formData.get("sizes") as string) || "[]"),
      stock: Number(formData.get("stock")) || 0,
      active: formData.get("active") === "true",
    };

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
