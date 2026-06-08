import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/mongodb";
import Order from "../src/models/Order";

async function main() {
  await dbConnect();
  const orderNumber = process.argv[2] || "ORD-6D44BCAC5CB4";
  const order: any = await Order.findOne({ orderNumber }).lean();

  if (!order) {
    console.log(`Order ${orderNumber} not found.`);
    process.exit(0);
  }

  const itemsSubtotal = (order.items || []).reduce(
    (s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );

  console.log(`\nOrder: ${order.orderNumber}`);
  console.log(`  paymentMethod : ${order.paymentMethod}`);
  console.log(`  paymentStatus : ${order.paymentStatus}`);
  console.log(`  region        : ${order.region}`);
  console.log(`  village       : ${order.village}`);
  console.log(`  deliveryMethod: ${order.deliveryMethod}`);
  console.log(`  deliveryPrice : ${order.deliveryPrice}`);
  console.log(`  items subtotal: ${itemsSubtotal}`);
  console.log(`  totalAmount   : ${order.totalAmount}  (UZS)`);
  console.log(`  → URL a=      : ${order.totalAmount * 100} (tiins)`);
  console.log(`\n  Items:`);
  for (const i of order.items || []) {
    console.log(`    - ${i.product?.name ?? "?"} | ${i.color}/${i.size} x${i.quantity} @ ${i.price}`);
  }
  console.log();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
