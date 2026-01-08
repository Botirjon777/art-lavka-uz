const mongoose = require('mongoose');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = "mongodb+srv://shokirovbotirjon2003_db_user:PUvmjzMBHOChVPbZ@cluster0.yuc3mhf.mongodb.net/?appName=Cluster0";

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', OrderSchema);

async function migrateOrderCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding orders without category field...');
    const orders = await Order.find({
      'items.product.category': { $exists: false }
    });

    console.log(`📦 Found ${orders.length} orders to update`);

    let updatedCount = 0;

    for (const order of orders) {
      // Update each item in the order to add category field
      const updatedItems = order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          category: 'women' // Set all to women since only women's clothes sold
        }
      }));

      await Order.updateOne(
        { _id: order._id },
        { $set: { items: updatedItems } }
      );

      updatedCount++;
      console.log(`✓ Updated order ${order.orderNumber} (${updatedCount}/${orders.length})`);
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} orders`);
    console.log('📊 All products now have category: "women"');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
migrateOrderCategories();
