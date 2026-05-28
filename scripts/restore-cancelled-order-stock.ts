import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/mongodb";
import Order from "../src/models/Order";
import Product from "../src/models/Product";

type StockItem = {
  productId: string;
  color: string;
  size: string;
  quantity: number;
};

async function restoreItems(items: StockItem[]) {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const colors = [...(product.colors || [])];
    const colorIndex = colors.findIndex((color: any) => color.name === item.color);
    if (colorIndex === -1) continue;

    const variantIndex = colors[colorIndex].variants?.findIndex(
      (variant: any) => variant.size === item.size,
    );
    if (variantIndex === undefined || variantIndex === -1) continue;

    colors[colorIndex].variants[variantIndex].stock =
      (Number(colors[colorIndex].variants[variantIndex].stock) || 0) +
      item.quantity;

    await Product.findByIdAndUpdate(item.productId, {
      $set: { colors },
      $inc: { stock: item.quantity },
    });
  }
}

async function main() {
  await dbConnect();

  const orders = await Order.find({
    status: "cancelled",
    orderNumber: { $not: /^SUP-/ },
    $or: [
      { stockRestoredOnCancel: { $exists: false } },
      { stockRestoredOnCancel: false },
    ],
  });

  console.log(`Found ${orders.length} cancelled orders to repair.`);

  for (const order of orders) {
    const items = order.items.map((item: any) => ({
      productId: item.product._id,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
    }));

    await restoreItems(items);
    order.stockRestoredOnCancel = true;
    await order.save();
    console.log(`Restored stock for ${order.orderNumber}`);
  }

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to restore cancelled order stock:", error);
    process.exit(1);
  });
