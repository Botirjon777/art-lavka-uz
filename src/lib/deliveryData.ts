export const DELIVERY_PRICES = {
  door: 30000,
  pickup: 15000,
} as const;

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
