export const BTS_CITIES = [
  "Нукус", "Ургенч", "Бухара", "Навои", "Самарканд", "Карши", "Термез", 
  "Джизак", "Гулистан", "Ташкент", "Коканд", "Наманган", "Фергана", "Андижан"
] as const;

export type BTSCity = typeof BTS_CITIES[number];

// Zone Matrix: Rows (Departure) x Columns (Arrival)
// Nukus: [0, 1, 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5]
// Urgench: [1, 0, 2, 2, 3, 2, 4, 3, 4, 4, 5, 5, 5, 5]
// Buhara: [2, 2, 0, 1, 1, 1, 2, 1, 2, 2, 3, 3, 4, 4]
// Navoi: [3, 2, 1, 0, 1, 1, 2, 1, 2, 2, 3, 3, 3, 3]
// Samarkand: [3, 3, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2]
// Karshi: [3, 2, 1, 1, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3]
// Termez: [4, 4, 2, 2, 1, 1, 0, 2, 3, 2, 4, 4, 4, 4]
// Jizzak: [4, 3, 1, 1, 1, 1, 2, 0, 1, 0, 1, 2, 2, 2]
// Gulistan: [5, 4, 2, 2, 1, 2, 3, 1, 0, 0, 1, 1, 1, 1]
// Tashkent: [5, 4, 2, 2, 1, 2, 3, 1, 1, 0, 1, 1, 1, 1]
// Kokand: [5, 5, 3, 3, 2, 3, 4, 1, 1, 1, 0, 1, 1, 1]
// Namangan: [5, 5, 3, 3, 2, 3, 4, 2, 1, 1, 1, 0, 1, 1]
// Fergana: [5, 5, 4, 3, 2, 3, 4, 2, 1, 1, 1, 1, 0, 1]
// Andijan: [5, 5, 4, 3, 2, 3, 4, 2, 1, 1, 1, 1, 1, 0]

export const BTS_ZONE_MATRIX: number[][] = [
  [0, 1, 2, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5], // Nukus
  [1, 0, 2, 2, 3, 2, 4, 3, 4, 4, 5, 5, 5, 5], // Urgench
  [2, 2, 0, 1, 1, 1, 2, 1, 2, 2, 3, 3, 4, 4], // Bukhara
  [3, 2, 1, 0, 1, 1, 2, 1, 2, 2, 3, 3, 3, 3], // Navoi
  [3, 3, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2], // Samarkand
  [3, 2, 1, 1, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3], // Karshi
  [4, 4, 2, 2, 1, 1, 0, 2, 3, 2, 4, 4, 4, 4], // Termez
  [4, 3, 1, 1, 1, 1, 2, 0, 1, 0, 1, 2, 2, 2], // Jizzakh
  [5, 4, 2, 2, 1, 2, 3, 1, 0, 0, 1, 1, 1, 1], // Gulistan
  [5, 4, 2, 2, 1, 2, 3, 1, 1, 0, 1, 1, 1, 1], // Tashkent
  [5, 5, 3, 3, 2, 3, 4, 1, 1, 1, 0, 1, 1, 1], // Kokand
  [5, 5, 3, 3, 2, 3, 4, 2, 1, 1, 1, 0, 1, 1], // Namangan
  [5, 5, 4, 3, 2, 3, 4, 2, 1, 1, 1, 1, 0, 1], // Fergana
  [5, 5, 4, 3, 2, 3, 4, 2, 1, 1, 1, 1, 1, 0], // Andijan
];

// Price List Table 2.1.1 (Office to Office)
// Weight (1-20kg) x Zone (0-5)
export const BTS_PRICES: Record<number, number[]> = {
  1: [24000, 28000, 30000, 33000, 35000, 38000],
  2: [27000, 36000, 38000, 42000, 44000, 48000],
  3: [30000, 43000, 46000, 50000, 53000, 57000],
  4: [33000, 51000, 54000, 59000, 62000, 67000],
  5: [36000, 58000, 62000, 67000, 71000, 76000],
  6: [39000, 66000, 70000, 76000, 80000, 86000],
  7: [42000, 73000, 78000, 84000, 89000, 95000],
  8: [45000, 81000, 86000, 93000, 98000, 105000],
  9: [48000, 88000, 94000, 101000, 107000, 114000],
  10: [51000, 96000, 102000, 110000, 116000, 124000],
  11: [54000, 103000, 109000, 118000, 124000, 133000],
  12: [56000, 109000, 116000, 125000, 132000, 141000],
  13: [59000, 116000, 123000, 133000, 140000, 150000],
  14: [61000, 122000, 130000, 140000, 148000, 158000],
  15: [64000, 129000, 137000, 148000, 156000, 167000],
  16: [66000, 135000, 144000, 155000, 164000, 175000],
  17: [69000, 142000, 151000, 163000, 172000, 184000],
  18: [71000, 148000, 158000, 170000, 180000, 192000],
  19: [74000, 155000, 165000, 178000, 188000, 201000],
  20: [76000, 161000, 172000, 185000, 196000, 209000],
};

// Courier Fees (Table 3.1)
// City pickup/delivery fees based on weight
export const BTS_COURIER_FEES = {
  upto10kg: 30000,
  upto20kg: 40000,
};

// Delivery Days Matrix (Table 1.2.1)
export const BTS_DELIVERY_DAYS: number[][] = [
  [2, 2, 3, 3, 3, 3, 3], // Nukus
  [2, 2, 2, 2, 2, 2, 3], // Urgench
  [3, 2, 2, 2, 3, 2, 3], // Navoi/Sam/Jiz/Gul
  [3, 2, 2, 2, 2, 2, 3], // Karshi
  [3, 2, 3, 2, 2, 2, 3], // Termez
  [3, 2, 2, 2, 2, 2, 2], // Tashkent
  [3, 3, 3, 3, 3, 2, 2], // Fergana/Nam/And/Kok
];

// Map internal region names to BTS_CITIES indices
export const REGION_TO_BTS_HUB: Record<string, number> = {
  "город Ташкент": 9,
  "Ташкентская область": 9,
  "Андижанская область": 13,
  "Бухарская область": 2,
  "Ферганская область": 12,
  "Джизакская область": 7,
  "Хорезмская область": 1,
  "Наманганская область": 11,
  "Навоийская область": 3,
  "Кашкадарьинская область": 5,
  "Республика Каракалпакстан": 0,
  "Самаркандская область": 4,
  "Сырдарьинская область": 8,
  "Сурхандарьинская область": 6,
};

// Shipping Origin is Fergana (Index 12)
const ORIGIN_CITY_INDEX = 12;

/**
 * Calculates delivery price according to BTS Express tariffs
 * @param targetRegion - User selected region
 * @param targetDistrict - User selected district (to handle specific cities like Kokand)
 * @param weight - Total weight in kg
 * @param method - 'door' or 'pickup'
 */
export function calculateBTSDelivery(
  targetRegion: string,
  targetDistrict: string,
  weight: number,
  method: "door" | "pickup"
): number {
  if (!targetRegion) return 30000; // default base

  // 1. Determine target city index
  let targetIndex = REGION_TO_BTS_HUB[targetRegion] ?? 9;

  // Handle specific city hubs within regions (e.g. Kokand in Fergana)
  if (targetDistrict?.toLowerCase().includes("коканд") || targetDistrict?.toLowerCase().includes("qo'qon")) {
    targetIndex = 10;
  }
  if (targetDistrict?.toLowerCase().includes("ургенч") || targetDistrict?.toLowerCase().includes("urganch")) {
    targetIndex = 1;
  }
  if (targetDistrict?.toLowerCase().includes("самарканд") || targetDistrict?.toLowerCase().includes("samarqand")) {
    targetIndex = 4;
  }
  // ... can add more specific mappings if needed

  // 2. Get Zone from Matrix
  const zone = BTS_ZONE_MATRIX[ORIGIN_CITY_INDEX][targetIndex];

  // 3. Get Price from Table (normalize weight 1-20kg)
  const normalizedWeight = Math.max(1, Math.min(20, Math.ceil(weight)));
  const basePrice = BTS_PRICES[normalizedWeight][zone];

  // 4. Add Courier Fee if "Door" delivery
  let courierFee = 0;
  if (method === "door") {
    courierFee = normalizedWeight <= 10 ? BTS_COURIER_FEES.upto10kg : BTS_COURIER_FEES.upto20kg;
  }

  return basePrice + courierFee;
}

// Map actual city index to Delivery Days Matrix Row/Col
export const getCityGroupIndex = (cityIndex: number): number => {
  if (cityIndex <= 1) return cityIndex; // Nukus, Urgench
  if (cityIndex === 2) return 2; // Buhara
  if (cityIndex <= 4) return 2; // Navoi, Samarkand
  if (cityIndex === 5) return 3; // Karshi
  if (cityIndex === 6) return 4; // Termez
  if (cityIndex <= 8) return 2; // Jizzak, Gulistan
  if (cityIndex === 9) return 5; // Tashkent
  if (cityIndex <= 13) return 6; // Kokand, Namangan, Fergana, Andijan
  return 0;
};
