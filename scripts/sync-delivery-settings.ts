import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/mongodb";
import Settings from "../src/models/Settings";
import {
  BTS_PRICES,
  BTS_COURIER_FEES,
  REGION_ZONES,
} from "../src/lib/deliveryDataBTS";

const ZONES = [0, 1, 2, 3, 4, 5];

function printPriceTable(prices: Record<string, number[]>, label: string) {
  console.log(`\n── ${label} ──`);
  console.log(
    "кг".padEnd(6) +
      ZONES.map((z) => `Зона ${z}`.padStart(10)).join("")
  );
  for (let w = 1; w <= 20; w++) {
    const row = prices[w] ?? prices[String(w)];
    if (!row) { console.log(`${w} кг`.padEnd(6) + "  (нет данных)"); continue; }
    console.log(
      `${w} кг`.padEnd(6) + row.map((p) => String(p).padStart(10)).join("")
    );
  }
}

function printRegionZones(zones: Record<string, number>, label: string) {
  console.log(`\n── ${label} ──`);
  for (const [region, zone] of Object.entries(zones).sort((a, b) => a[1] - b[1])) {
    console.log(`  Зона ${zone}  ${region}`);
  }
}

async function main() {
  await dbConnect();

  const settings = await Settings.findOne(
    {},
    { deliveryPrices: 1, courierFees: 1, regionZones: 1, ferganaFreeDelivery: 1 }
  ).lean();

  if (!settings) {
    console.log("⚠  Settings document not found — nothing to update.");
    process.exit(0);
  }

  const dbPrices = (settings as any).deliveryPrices as Record<string, number[]> | undefined;
  const dbFees = settings.courierFees as { upto10kg: number; upto20kg: number } | undefined;
  const dbZones = (settings as any).regionZones as Record<string, number> | undefined;
  const ferganaFree = (settings as any).ferganaFreeDelivery ?? true;

  // ── Current state ──────────────────────────────────────────────────────────
  console.log("\n====== ТЕКУЩЕЕ СОСТОЯНИЕ В БД ======");

  if (dbPrices) {
    printPriceTable(dbPrices, "deliveryPrices (цены по весу и зонам)");
  } else {
    console.log("\ndeliveryPrices: не задано (будут использованы значения из кода)");
  }

  console.log(`\nCourierFees в БД: upto10kg=${dbFees?.upto10kg ?? "н/д"}, upto20kg=${dbFees?.upto20kg ?? "н/д"}`);
  console.log(`ferganaFreeDelivery: ${ferganaFree}`);

  if (dbZones) {
    printRegionZones(dbZones, "regionZones (зона для каждого региона)");
  } else {
    console.log("\nregionZones: не задано");
  }

  // ── Diff vs code defaults ──────────────────────────────────────────────────
  console.log("\n====== ЗНАЧЕНИЯ ИЗ КОДА (PDF BTS, с 15.07.2025) ======");
  printPriceTable(BTS_PRICES as any, "BTS_PRICES");
  console.log(`\nBTS_COURIER_FEES: upto10kg=${BTS_COURIER_FEES.upto10kg}, upto20kg=${BTS_COURIER_FEES.upto20kg}`);
  printRegionZones(REGION_ZONES, "REGION_ZONES");

  // ── Detect diffs ────────────────────────────────────────────────────────────
  let pricesDiffer = false;
  for (let w = 1; w <= 20; w++) {
    const dbRow = dbPrices?.[w] ?? dbPrices?.[String(w)];
    const codeRow = (BTS_PRICES as any)[w] as number[];
    if (!dbRow || JSON.stringify(dbRow) !== JSON.stringify(codeRow)) {
      pricesDiffer = true;
      break;
    }
  }

  const feesDiffer =
    dbFees?.upto10kg !== BTS_COURIER_FEES.upto10kg ||
    dbFees?.upto20kg !== BTS_COURIER_FEES.upto20kg;

  let zonesDiffer = !dbZones;
  if (dbZones) {
    for (const [region, zone] of Object.entries(REGION_ZONES)) {
      if (dbZones[region] !== zone) { zonesDiffer = true; break; }
    }
  }

  if (!pricesDiffer && !feesDiffer && !zonesDiffer) {
    console.log("\n✅ БД уже содержит актуальные значения. Обновление не требуется.");
    process.exit(0);
  }

  console.log("\n====== ОБНАРУЖЕНЫ ОТЛИЧИЯ — ОБНОВЛЯЕМ ======");
  if (pricesDiffer) console.log("  • deliveryPrices");
  if (feesDiffer)   console.log("  • courierFees");
  if (zonesDiffer)  console.log("  • regionZones");

  // ── Apply update ────────────────────────────────────────────────────────────
  const doc = await Settings.findOne();
  if (!doc) { console.log("⚠  Документ не найден при попытке записи."); process.exit(1); }

  if (pricesDiffer) {
    doc.deliveryPrices = BTS_PRICES as any;
    doc.markModified("deliveryPrices");
  }
  if (feesDiffer) {
    doc.courierFees = BTS_COURIER_FEES;
  }
  if (zonesDiffer) {
    (doc as any).regionZones = REGION_ZONES;
    doc.markModified("regionZones");
  }

  await doc.save();
  console.log("\n✅ БД обновлена успешно.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});
