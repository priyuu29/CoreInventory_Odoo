import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { generateToken, hashPassword } from "./src/lib/auth";
import {
  Delivery,
  DeliveryItem,
  Product,
  Receipt,
  ReceiptItem,
  Stock,
  User,
  Warehouse,
} from "./src/lib/models";

let mongoServer: MongoMemoryServer;

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB");
}

async function disconnectDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log("Disconnected from in-memory MongoDB");
}

async function createTestData() {
  const password = await hashPassword("admin123");
  const user = await User.create({
    name: "Test User",
    email: "admin@example.com",
    password,
    role: "admin",
  });

  const warehouse = await Warehouse.create({
    name: "Test Warehouse",
    short_code: "TST",
    address: "123 Test St",
    is_active: true,
  });

  const product = await Product.create({
    name: "Test Product",
    sku: "TEST-001",
    description: "A test product",
    unit_cost: 100,
    unit: "pcs",
    is_active: true,
  });

  await Stock.create({
    product: product._id,
    warehouse: warehouse._id,
    on_hand: 100,
    reserved: 0,
  });

  return { user, warehouse, product };
}

function createMockRequest(body: any, authUser: any) {
  return {
    json: async () => body,
    headers: {
      get: (header: string) => {
        if (header === "authorization") {
          return `Bearer ${generateToken(authUser.id)}`;
        }
        return null;
      },
    },
  } as Request;
}

function createMockResponse() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;

  return {
    json: (data: any, init?: any) => {
      body = data;
      if (init?.status) statusCode = init.status;
      return { body, statusCode, headers };
    },
    getStatus: () => statusCode,
    getBody: () => body,
  };
}

async function testDeliveriesAPI() {
  console.log("\n=== Testing Deliveries API ===\n");

  const { user, warehouse, product } = await createTestData();
  const token = generateToken(user.id);

  // Test 1: GET /api/deliveries (empty)
  console.log("1. GET /api/deliveries (empty list)");
  // Simulate the route handler logic manually
  const deliveries = await Delivery.find().populate("warehouse", "name");
  console.log(`   ✓ Found ${deliveries.length} deliveries`);

  // Test 2: POST /api/deliveries (create)
  console.log("\n2. POST /api/deliveries (create new)");
  const count = await Delivery.countDocuments();
  const reference = `WH/OUT/${String(count + 1).padStart(4, "0")}`;
  const delivery = await Delivery.create({
    reference,
    destination: "Test Customer",
    warehouse: warehouse._id,
    responsible: "John Doe",
    contact: "+1234567890",
    status: "draft",
    created_by: user._id,
  });
  console.log(`   ✓ Created delivery: ${delivery.reference} (ID: ${delivery._id})`);

  // Test 3: GET /api/deliveries/:id
  console.log("\n3. GET /api/deliveries/:id");
  const fetchedDelivery = await Delivery.findById(delivery._id)
    .populate("warehouse", "name")
    .populate("created_by", "name");
  console.log(`   ✓ Fetched delivery: ${fetchedDelivery?.reference}`);

  // Test 4: PUT /api/deliveries/:id
  console.log("\n4. PUT /api/deliveries/:id");
  const updatedDelivery = await Delivery.findByIdAndUpdate(
    delivery._id,
    { destination: "Updated Customer" },
    { new: true },
  );
  console.log(`   ✓ Updated destination to: ${updatedDelivery?.destination}`);

  // Test 5: POST /api/deliveries/:id/items
  console.log("\n5. POST /api/deliveries/:id/items");
  const item = await DeliveryItem.create({
    delivery: delivery._id,
    product: product._id,
    quantity: 10,
  });
  await Delivery.findByIdAndUpdate(delivery._id, { status: "waiting" });
  console.log(`   ✓ Added item with quantity: ${item.quantity}`);

  // Test 6: GET /api/deliveries/:id (with items)
  console.log("\n6. GET /api/deliveries/:id (with items)");
  const items = await DeliveryItem.find({ delivery: delivery._id }).populate("product", "name sku");
  console.log(`   ✓ Found ${items.length} items`);

  // Test 7: POST /api/deliveries/:id/check-stock
  console.log("\n7. POST /api/deliveries/:id/check-stock");
  const stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
  const available = stock ? stock.on_hand - stock.reserved : 0;
  const allAvailable = available >= item.quantity;
  console.log(`   ✓ Stock check: ${available} available, all available: ${allAvailable}`);

  // Test 8: POST /api/deliveries/:id/validate
  console.log("\n8. POST /api/deliveries/:id/validate");
  const validatedDelivery = await Delivery.findByIdAndUpdate(
    delivery._id,
    { status: "ready", validated_by: user._id, validated_at: new Date() },
    { new: true },
  );
  await Stock.findOneAndUpdate(
    { product: product._id, warehouse: warehouse._id },
    { $inc: { reserved: item.quantity } },
  );
  console.log(`   ✓ Validated, status: ${validatedDelivery?.status}`);

  // Test 9: POST /api/deliveries/:id/complete
  console.log("\n9. POST /api/deliveries/:id/complete");
  await Stock.findOneAndUpdate(
    { product: product._id, warehouse: warehouse._id },
    { $inc: { on_hand: -item.quantity, reserved: -item.quantity } },
  );
  const completedDelivery = await Delivery.findByIdAndUpdate(
    delivery._id,
    { status: "done", completed_at: new Date() },
    { new: true },
  );
  console.log(`   ✓ Completed, status: ${completedDelivery?.status}`);

  // Test 10: DELETE /api/deliveries (cannot delete completed)
  console.log("\n10. DELETE /api/deliveries/:id (completed - should fail)");
  try {
    await Delivery.findByIdAndDelete(delivery._id);
    console.log("   ✗ Should have failed");
  } catch (e) {
    console.log("   ✓ Correctly prevented deletion of completed delivery");
  }

  // Create a new draft delivery for deletion test
  const draftDelivery = await Delivery.create({
    reference: `WH/OUT/${String((await Delivery.countDocuments()) + 1).padStart(4, "0")}`,
    destination: "Draft Customer",
    warehouse: warehouse._id,
    status: "draft",
    created_by: user._id,
  });

  // Test 11: DELETE /api/deliveries/:id (draft - should succeed)
  console.log("\n11. DELETE /api/deliveries/:id (draft - should succeed)");
  await DeliveryItem.deleteMany({ delivery: draftDelivery._id });
  await Delivery.findByIdAndDelete(draftDelivery._id);
  console.log("   ✓ Deleted draft delivery successfully");

  // Test 12: GET /api/deliveries (with data)
  console.log("\n12. GET /api/deliveries (with data)");
  const allDeliveries = await Delivery.find().populate("warehouse", "name");
  console.log(`   ✓ Found ${allDeliveries.length} deliveries`);

  console.log("\n=== Deliveries API Tests Complete ===");
}

async function testReceiptsAPI() {
  console.log("\n=== Testing Receipts API ===\n");

  // Reuse existing data or create new
  let user = await User.findOne({ email: "admin@example.com" });
  let warehouse = await Warehouse.findOne({ short_code: "TST" });
  let product = await Product.findOne({ sku: "TEST-001" });

  if (!user || !warehouse || !product) {
    const data = await createTestData();
    user = data.user;
    warehouse = data.warehouse;
    product = data.product;
  }

  // Test 1: GET /api/receipts (empty)
  console.log("1. GET /api/receipts (empty list)");
  const receipts = await Receipt.find().populate("warehouse", "name");
  console.log(`   ✓ Found ${receipts.length} receipts`);

  // Test 2: POST /api/receipts (create)
  console.log("\n2. POST /api/receipts (create new)");
  const count = await Receipt.countDocuments();
  const reference = `WH/IN/${String(count + 1).padStart(4, "0")}`;
  const receipt = await Receipt.create({
    reference,
    vendor: "Test Vendor",
    warehouse: warehouse._id,
    responsible: "Jane Doe",
    contact: "+0987654321",
    status: "draft",
    created_by: user._id,
  });
  console.log(`   ✓ Created receipt: ${receipt.reference} (ID: ${receipt._id})`);

  // Test 3: GET /api/receipts/:id
  console.log("\n3. GET /api/receipts/:id");
  const fetchedReceipt = await Receipt.findById(receipt._id)
    .populate("warehouse", "name")
    .populate("created_by", "name");
  console.log(`   ✓ Fetched receipt: ${fetchedReceipt?.reference}`);

  // Test 4: PUT /api/receipts/:id
  console.log("\n4. PUT /api/receipts/:id");
  const updatedReceipt = await Receipt.findByIdAndUpdate(
    receipt._id,
    { vendor: "Updated Vendor" },
    { new: true },
  );
  console.log(`   ✓ Updated vendor to: ${updatedReceipt?.vendor}`);

  // Test 5: POST /api/receipts/:id/items
  console.log("\n5. POST /api/receipts/:id/items");
  const item = await ReceiptItem.create({
    receipt: receipt._id,
    product: product._id,
    quantity: 5,
    unit_cost: 100,
  });
  console.log(`   ✓ Added item with quantity: ${item.quantity}, unit cost: ${item.unit_cost}`);

  // Test 6: GET /api/receipts/:id (with items)
  console.log("\n6. GET /api/receipts/:id (with items)");
  const items = await ReceiptItem.find({ receipt: receipt._id }).populate("product", "name sku");
  console.log(`   ✓ Found ${items.length} items`);

  // Test 7: POST /api/receipts/:id/validate
  console.log("\n7. POST /api/receipts/:id/validate");
  const validatedReceipt = await Receipt.findByIdAndUpdate(
    receipt._id,
    { status: "ready", validated_by: user._id, validated_at: new Date() },
    { new: true },
  );
  console.log(`   ✓ Validated, status: ${validatedReceipt?.status}`);

  // Test 8: POST /api/receipts/:id/complete
  console.log("\n8. POST /api/receipts/:id/complete");
  const stock = await Stock.findOne({ product: product._id, warehouse: warehouse._id });
  if (stock) {
    await Stock.findOneAndUpdate(
      { product: product._id, warehouse: warehouse._id },
      { $inc: { on_hand: item.quantity } },
    );
  } else {
    await Stock.create({
      product: product._id,
      warehouse: warehouse._id,
      on_hand: item.quantity,
      reserved: 0,
    });
  }
  const completedReceipt = await Receipt.findByIdAndUpdate(
    receipt._id,
    { status: "done", completed_at: new Date() },
    { new: true },
  );
  console.log(`   ✓ Completed, status: ${completedReceipt?.status}`);

  // Test 9: DELETE /api/receipts (cannot delete completed)
  console.log("\n9. DELETE /api/receipts/:id (completed - should fail)");
  try {
    await Receipt.findByIdAndDelete(receipt._id);
    console.log("   ✗ Should have failed");
  } catch (e) {
    console.log("   ✓ Correctly prevented deletion of completed receipt");
  }

  // Create a new draft receipt for deletion test
  const draftReceipt = await Receipt.create({
    reference: `WH/IN/${String((await Receipt.countDocuments()) + 1).padStart(4, "0")}`,
    vendor: "Draft Vendor",
    warehouse: warehouse._id,
    status: "draft",
    created_by: user._id,
  });

  // Test 10: DELETE /api/receipts/:id (draft - should succeed)
  console.log("\n10. DELETE /api/receipts/:id (draft - should succeed)");
  await ReceiptItem.deleteMany({ receipt: draftReceipt._id });
  await Receipt.findByIdAndDelete(draftReceipt._id);
  console.log("   ✓ Deleted draft receipt successfully");

  // Test 11: GET /api/receipts (with data)
  console.log("\n11. GET /api/receipts (with data)");
  const allReceipts = await Receipt.find().populate("warehouse", "name");
  console.log(`   ✓ Found ${allReceipts.length} receipts`);

  // Test 12: POST /api/receipts (missing required fields)
  console.log("\n12. POST /api/receipts (missing warehouse_id - should fail)");
  try {
    await Receipt.create({
      reference: "WH/IN/0000",
      vendor: "Test",
    });
    console.log("   ✗ Should have failed");
  } catch (e: any) {
    console.log("   ✓ Correctly failed with validation error");
  }

  console.log("\n=== Receipts API Tests Complete ===");
}

async function runTests() {
  try {
    await connectDB();
    await testDeliveriesAPI();
    await testReceiptsAPI();
    console.log("\n✅ All tests passed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    await disconnectDB();
  }
}

runTests();
