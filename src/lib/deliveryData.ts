export const DELIVERY_PRICES = {
  door: 30000,
  pickup: 15000,
} as const;

/**
 * Calculates delivery price based on weight and method.
 * Door: 30k base (<1kg) + 10k per additional kg (rounded up)
 * Pickup: 15k Fixed
 */
export function calculateDeliveryPrice(totalWeight: number, method: "door" | "pickup"): number {
  if (method === "pickup") {
    return DELIVERY_PRICES.pickup;
  }

  const basePrice = DELIVERY_PRICES.door;
  if (totalWeight <= 1) {
    return basePrice;
  }

  const extraWeight = Math.ceil(totalWeight - 1);
  return basePrice + (extraWeight * 10000);
}

export interface DeliveryBranch {
  id: string;
  name: string;
  address: string;
}

/**
 * Generates test branches for any given district.
 * To be replaced with real data in the future.
 */
export function getBranches(region: string, district: string): DeliveryBranch[] {
  // Simple deterministic generation for test purposes
  return [
    {
      id: `${district}-b1`,
      name: `${district} - Филиал 1`,
      address: `г. ${region}, ${district}, ул. Тестовая 1 (ориентир: Школа №1)`,
    },
    {
      id: `${district}-b2`,
      name: `${district} - Филиал 2`,
      address: `г. ${region}, ${district}, ул. Тестовая 2 (ориентир: Рядом с рынком)`,
    },
  ];
}
