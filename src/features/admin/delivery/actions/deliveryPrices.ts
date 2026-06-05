"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { BTS_PRICES, BTS_COURIER_FEES, REGION_ZONES } from "@/lib/deliveryDataBTS";
import { requireAdmin } from "@/lib/requireAdmin";

export const getDeliverySettings = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const settings = await Settings.findOne({}, { deliveryPrices: 1, courierFees: 1, ferganaFreeDelivery: 1, regionZones: 1 }).lean();
      if (!settings) {
        return { success: false, error: "Settings not found" };
      }
      return {
        success: true,
        deliveryPrices: JSON.parse(JSON.stringify(settings.deliveryPrices || BTS_PRICES)),
        courierFees: JSON.parse(JSON.stringify(settings.courierFees || BTS_COURIER_FEES)),
        ferganaFreeDelivery: (settings as any).ferganaFreeDelivery ?? true,
        regionZones: JSON.parse(JSON.stringify((settings as any).regionZones || REGION_ZONES)),
      };
    } catch (error: any) {
      console.error("Error fetching delivery settings:", error);
      return { success: false, error: error.message };
    }
  },
  ["delivery-settings"],
  { revalidate: 86400, tags: ["delivery-settings"] }
);

export async function updateDeliverySettings(data: { deliveryPrices: any; courierFees: any }) {
  try {
    await requireAdmin();
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { success: false, error: "Settings not found" };
    }

    settings.deliveryPrices = data.deliveryPrices;
    settings.courierFees = data.courierFees;
    settings.markModified("deliveryPrices");
    settings.markModified("courierFees");

    await settings.save();
    revalidateTag("delivery-settings", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating delivery settings:", error);
    return { success: false, error: error.message };
  }
}

export async function bustDeliveryCache() {
  try {
    await requireAdmin();
    revalidateTag("delivery-settings", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRegionZones(zones: Record<string, number>) {
  try {
    await requireAdmin();
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { success: false, error: "Settings not found" };
    }
    (settings as any).regionZones = zones;
    settings.markModified("regionZones");
    await settings.save();
    revalidateTag("delivery-settings", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating regionZones:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFerganaFreeDelivery(value: boolean) {
  try {
    await requireAdmin();
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { success: false, error: "Settings not found" };
    }
    settings.ferganaFreeDelivery = value;
    await settings.save();
    revalidateTag("delivery-settings", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating ferganaFreeDelivery:", error);
    return { success: false, error: error.message };
  }
}
