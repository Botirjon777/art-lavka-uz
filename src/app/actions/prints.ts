"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Print from "@/models/Print";

export async function getPrints() {
  try {
    await dbConnect();
    const prints = await Print.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(prints));
  } catch (error) {
    console.error("Error fetching prints:", error);
    return [];
  }
}

export async function createPrint(formData: FormData) {
  try {
    await dbConnect();

    const printData = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      category: formData.get("category") as string,
      active: formData.get("active") === "true",
    };

    const print = await Print.create(printData);
    revalidatePath("/admin/prints");
    return { success: true, print: JSON.parse(JSON.stringify(print)) };
  } catch (error: any) {
    console.error("Error creating print:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrint(id: string, formData: FormData) {
  try {
    await dbConnect();

    const printData = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      category: formData.get("category") as string,
      active: formData.get("active") === "true",
    };

    const print = await Print.findByIdAndUpdate(id, printData, { new: true });

    if (!print) {
      return { success: false, error: "Print not found" };
    }

    revalidatePath("/admin/prints");
    return { success: true, print: JSON.parse(JSON.stringify(print)) };
  } catch (error: any) {
    console.error("Error updating print:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePrint(id: string) {
  try {
    await dbConnect();
    await Print.findByIdAndDelete(id);
    revalidatePath("/admin/prints");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting print:", error);
    return { success: false, error: error.message };
  }
}
