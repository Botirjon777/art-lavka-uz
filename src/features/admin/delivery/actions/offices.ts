"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Office from "@/models/Office";
import btsOfficesJson from "@/lib/btsOffices.json";

export const getOffices = unstable_cache(
  async (region?: string) => {
    try {
      await dbConnect();
      const query = region ? { region } : {};
      const offices = await Office.find(query).sort({ region: 1, name: 1 }).lean();
      return { success: true, data: JSON.parse(JSON.stringify(offices)) };
    } catch (error: any) {
      console.error("Error fetching offices:", error);
      return { success: false, error: error.message };
    }
  },
  ["offices-list"],
  { revalidate: 86400, tags: ["offices"] }
);

export async function createOffice(formData: FormData) {
  try {
    await dbConnect();
    const data = {
      region: formData.get("region") as string,
      district: formData.get("district") as string,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") === "true",
    };

    const office = await Office.create(data);
    revalidateTag("offices", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true, data: JSON.parse(JSON.stringify(office)) };
  } catch (error: any) {
    console.error("Error creating office:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOffice(id: string, formData: FormData) {
  try {
    await dbConnect();
    const data = {
      region: formData.get("region") as string,
      district: formData.get("district") as string,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") === "true",
    };

    const office = await Office.findByIdAndUpdate(id, data, { new: true });
    revalidateTag("offices", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true, data: JSON.parse(JSON.stringify(office)) };
  } catch (error: any) {
    console.error("Error updating office:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOffice(id: string) {
  try {
    await dbConnect();
    await Office.findByIdAndDelete(id);
    revalidateTag("offices", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting office:", error);
    return { success: false, error: error.message };
  }
}

export async function importFromDefaults() {
  try {
    await dbConnect();
    
    // Check if we already have offices to avoid duplicates
    const count = await Office.countDocuments();
    if (count > 0) {
      return { success: false, error: "Database already contains offices. Clean it first if you want to re-import." };
    }

    const officesToImport = btsOfficesJson.map((item: any) => ({
      region: item.region,
      district: item.district,
      name: item.name,
      address: item.address,
      isActive: true
    }));

    await Office.insertMany(officesToImport);
    revalidateTag("offices", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true, count: officesToImport.length };
  } catch (error: any) {
    console.error("Error importing offices:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleOfficeStatus(id: string, isActive: boolean) {
  try {
    await dbConnect();
    await Office.findByIdAndUpdate(id, { isActive });
    revalidateTag("offices", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling office status:", error);
    return { success: false, error: error.message };
  }
}
