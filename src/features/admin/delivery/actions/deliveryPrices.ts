"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { BTS_PRICES, BTS_COURIER_FEES } from "@/lib/deliveryDataBTS";

export const getDeliverySettings = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const settings = await Settings.findOne({}, { deliveryPrices: 1, courierFees: 1 }).lean();
      if (!settings) {
         return { success: false, error: "Settings not found" };
      }
      return { 
        success: true, 
        deliveryPrices: JSON.parse(JSON.stringify(settings.deliveryPrices || BTS_PRICES)),
        courierFees: JSON.parse(JSON.stringify(settings.courierFees || BTS_COURIER_FEES))
      };
    } catch (error: any) {
      console.error("Error fetching delivery settings:", error);
      return { success: false, error: error.message };
    }
  },
  ["delivery-settings"],
  { revalidate: 86400, tags: ["delivery-settings"] }
);

export async function updateDeliverySettings(data: { deliveryPrices: any, courierFees: any }) {
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { success: false, error: "Settings not found" };
    }

    settings.deliveryPrices = data.deliveryPrices;
    settings.courierFees = data.courierFees;
    
    // Explicitly mark as modified since deliveryPrices is Schema.Types.Mixed
    settings.markModified('deliveryPrices');
    settings.markModified('courierFees');

    await settings.save();
    revalidateTag("delivery-settings", "default");
    revalidatePath("/admin/delivery", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating delivery settings:", error);
    return { success: false, error: error.message };
  }
}
