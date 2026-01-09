// Migration script to add region field to existing orders
// This script randomly assigns regions to orders that don't have a region field

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env file");
  process.exit(1);
}

const uzbekistanRegions = [
  "город Ташкент",
  "Ташкентская область",
  "Андижанская область",
  "Бухарская область",
  "Ферганская область",
  "Джизакская область",
  "Хорезмская область",
  "Наманганская область",
  "Навоийская область",
  "Кашкадарьинская область",
  "Республика Каракалпакстан",
  "Самаркандская область",
  "Сырдарьинская область",
  "Сурхандарьинская область",
];

// Function to get a random region
function getRandomRegion() {
  return uzbekistanRegions[Math.floor(Math.random() * uzbekistanRegions.length)];
}

async function migrateOrders() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // Find orders without a region field
    const ordersWithoutRegion = await ordersCollection
      .find({
        $or: [{ region: { $exists: false } }, { region: null }, { region: "" }],
      })
      .toArray();

    console.log(`\n📊 Found ${ordersWithoutRegion.length} orders without region field`);

    if (ordersWithoutRegion.length === 0) {
      console.log("✅ All orders already have region field. Nothing to migrate.");
      await mongoose.connection.close();
      return;
    }

    console.log("\n🔄 Starting migration...\n");

    let updatedCount = 0;

    for (const order of ordersWithoutRegion) {
      const randomRegion = getRandomRegion();

      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { region: randomRegion } }
      );

      updatedCount++;
      console.log(
        `✅ Updated order ${order.orderNumber} - Assigned region: ${randomRegion}`
      );
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Total orders updated: ${updatedCount}`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateOrders();
