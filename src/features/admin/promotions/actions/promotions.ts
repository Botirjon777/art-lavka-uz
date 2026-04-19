"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Promotion from "@/models/Promotion";

export async function getPromotions() {
  try {
    await dbConnect();
    const promotions = await Promotion.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(promotions)) };
  } catch (error: any) {
    console.error("Error fetching promotions:", error);
    return { success: false, error: error.message };
  }
}

export async function getPromotionById(id: string) {
  try {
    await dbConnect();
    const promotion = await Promotion.findById(id).lean();
    if (!promotion) return { success: false, error: "Promotion not found" };
    return { success: true, data: JSON.parse(JSON.stringify(promotion)) };
  } catch (error: any) {
    console.error("Error fetching promotion:", error);
    return { success: false, error: error.message };
  }
}

export async function createPromotion(formData: FormData) {
  try {
    await dbConnect();

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      conditionType: formData.get("conditionType") as string,
      conditionValue: JSON.parse((formData.get("conditionValue") as string) || "null"),
      discountType: formData.get("discountType") as string,
      discountValue: parseFloat(formData.get("discountValue") as string) || 0,
      isActive: formData.get("isActive") === "true",
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      description: formData.get("description") as string,
      translations: JSON.parse((formData.get("translations") as string) || "{}"),
    };

    const promotion = await Promotion.create(data);
    revalidatePath("/admin/promotions");
    return { success: true, data: JSON.parse(JSON.stringify(promotion)) };
  } catch (error: any) {
    console.error("Error creating promotion:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePromotion(id: string, formData: FormData) {
  try {
    await dbConnect();

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      conditionType: formData.get("conditionType") as string,
      conditionValue: JSON.parse((formData.get("conditionValue") as string) || "null"),
      discountType: formData.get("discountType") as string,
      discountValue: parseFloat(formData.get("discountValue") as string) || 0,
      isActive: formData.get("isActive") === "true",
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      description: formData.get("description") as string,
      translations: JSON.parse((formData.get("translations") as string) || "{}"),
    };

    const promotion = await Promotion.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/admin/promotions");
    return { success: true, data: JSON.parse(JSON.stringify(promotion)) };
  } catch (error: any) {
    console.error("Error updating promotion:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePromotion(id: string) {
  try {
    await dbConnect();
    await Promotion.findByIdAndDelete(id);
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting promotion:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePromotionStatus(id: string, isActive: boolean) {
  try {
    await dbConnect();
    await Promotion.findByIdAndUpdate(id, { isActive });
    revalidatePath("/admin/promotions");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling promotion status:", error);
    return { success: false, error: error.message };
  }
}
