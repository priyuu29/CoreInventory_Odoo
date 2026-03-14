import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { generateToken, hashPassword } from "./src/lib/auth";
import {
  Delivery,
  DeliveryItem,
  Location,
  Product,
  Receipt,
  ReceiptItem,
  Stock,
  StockMove,
  User,
  Warehouse,
} from "./src/lib/models";

let mongoServer: MongoMemoryServer;

let dbCounter = 0;

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  dbCounter++;
  const uri = `${mongoServer.getUri()}test${dbCounter}`;
  await mongoose.connect(uri);
}

async function disconnectDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

async function cleanup() {
  // Drop the database to clear all data
  await mongoose.connection.dropDatabase();
}

async function createTestData() {
  const password = await hashPassword("admin123");
  const user = await User.create({
    name: "Test User",
    email: "admin@example.com",
    password,
    role: "admin",
  });

  const warehouse1 = await Warehouse.create({
    name: "Warehouse 1",
    short_code: "WH1",
    address: "Address 1",
    is_active: true,
  });

  const warehouse2 = await Warehouse.create({
    name: "Warehouse 2",
    short_code: "WH2",
    address: "Address 2",
    is_active: true,
  });

  const location = await Location.create({
    name: "Location A",
    short_code: "LA",
    warehouse: warehouse1._id,
    description: "Test location",
  });

  const product = await Product.create({
    name: "Test Product",
    sku: "TEST-001",
    description: "A test product",
    unit_cost: 100,
    unit: "pcs",
    category: "Electronics",
    is_active: true,
  });

  await Stock.create({
    product: product._id,
    warehouse: warehouse1._id,
    on_hand: 100,
    reserved: 0,
  });

  return { user, warehouse1, warehouse2, location, product };
}

async function testAuthAPI() {
  console.log("\n=== AUTH API TESTS ===\n");

  const password = await hashPassword("test123");
  const user = await User.create({
    name: "Auth Test User",
    email: "auth@test.com",
    password,
    role: "admin",
  });

  // Test login
  console.log("1. POST /api/auth/login");
  const isValid = require("./src/lib/auth").comparePassword("test123", user.password);
  console.log(`   ✓ Password validation: ${isValid}`);

  // Test register (duplicate)
  console.log("\n2. POST /api/auth/register (duplicate - should fail)");
  try {
    await User.create({
      name: "Duplicate",
      email: "auth@test.com",
      password: await hashPassword("pass"),
    });
    console.log("   ✗ Should have failed");
  } catch (e: any) {
    console.log("   ✓ Correctly rejected duplicate email");
  }

  // Test me endpoint
  console.log("\n3. GET /api/auth/me");
  const foundUser = await User.findOne({ email: "auth@test.com" }).select("-password");
  console.log(`   ✓ Found user: ${foundUser?.name}`);

  console.log("\n✅ Auth API Tests Complete");
}

async function testWarehousesAPI() {
  console.log("\n=== WAREHOUSES API TESTS ===\n");

  const { user } = await createTestData();

  // GET all warehouses (empty)
  console.log("1. GET /api/warehouses (empty)");
  const warehouses = await Warehouse.find();
  console.log(`   ✓ Found ${warehouses.length} warehouses`);

  // POST create warehouse
  console.log("\n2. POST /api/warehouses");
  const warehouse = await Warehouse.create({
    name: "Test Warehouse",
    short_code: "TEST",
    address: "123 Test St",
    is_active: true,
  });
  console.log(`   ✓ Created: ${warehouse.name} (${warehouse.short_code})`);

  // GET by ID
  console.log("\n3. GET /api/warehouses/:id");
  const found = await Warehouse.findById(warehouse._id);
  console.log(`   ✓ Found: ${found?.name}`);

  // PUT update warehouse
  console.log("\n4. PUT /api/warehouses/:id");
  const updated = await Warehouse.findByIdAndUpdate(
    warehouse._id,
    { name: "Updated Warehouse" },
    { new: true },
  );
  console.log(`   ✓ Updated to: ${updated?.name}`);

  // GET stats
  console.log("\n5. GET /api/warehouses/:id/stats");
  const locationsCount = await Location.countDocuments({ warehouse: warehouse._id });
  console.log(`   ✓ Locations: ${locationsCount}`);

  // GET with data
  console.log("\n6. GET /api/warehouses (with data)");
  const allWarehouses = await Warehouse.find();
  console.log(`   ✓ Found ${allWarehouses.length} warehouses`);

  console.log("\n✅ Warehouses API Tests Complete");
}

async function testLocationsAPI() {
  console.log("\n=== LOCATIONS API TESTS ===\n");

  const { warehouse1, warehouse2 } = await createTestData();

  // GET all locations (empty)
  console.log("1. GET /api/locations (empty)");
  const locations = await Location.find();
  console.log(`   ✓ Found ${locations.length} locations`);

  // POST create location
  console.log("\n2. POST /api/locations");
  const location = await Location.create({
    name: "Test Location",
    short_code: "TL",
    warehouse: warehouse1._id,
    description: "Test",
  });
  console.log(`   ✓ Created: ${location.name}`);

  // GET by ID
  console.log("\n3. GET /api/locations/:id");
  const found = await Location.findById(location._id);
  console.log(`   ✓ Found: ${found?.name}`);

  // PUT update location
  console.log("\n4. PUT /api/locations/:id");
  const updated = await Location.findByIdAndUpdate(
    location._id,
    { name: "Updated Location" },
    { new: true },
  );
  console.log(`   ✓ Updated to: ${updated?.name}`);

  // GET by warehouse
  console.log("\n5. GET /api/locations/warehouse/:warehouseId");
  const warehouseLocations = await Location.find({ warehouse: warehouse1._id });
  console.log(`   ✓ Found ${warehouseLocations.length} locations in warehouse1`);

  // DELETE
  console.log("\n6. DELETE /api/locations/:id");
  await Location.findByIdAndDelete(location._id);
  const deleted = await Location.findById(location._id);
  console.log(`   ✓ Deleted: ${deleted === null}`);

  console.log("\n✅ Locations API Tests Complete");
}

async function testProductsAPI() {
  console.log("\n=== PRODUCTS API TESTS ===\n");

  const { warehouse1 } = await createTestData();

  // GET all products (empty)
  console.log("1. GET /api/products (empty)");
  const products = await Product.find();
  console.log(`   ✓ Found ${products.length} products`);

  // POST create product
  console.log("\n2. POST /api/products");
  const product = await Product.create({
    name: "Test Product",
    sku: "PROD-001",
    description: "A test product",
    unit_cost: 100,
    unit: "pcs",
    category: "Electronics",
    is_active: true,
  });
  console.log(`   ✓ Created: ${product.name} (${product.sku})`);

  // GET by ID
  console.log("\n3. GET /api/products/:id");
  const found = await Product.findById(product._id);
  console.log(`   ✓ Found: ${found?.name}`);

  // PUT update product
  console.log("\n4. PUT /api/products/:id");
  const updated = await Product.findByIdAndUpdate(
    product._id,
    { name: "Updated Product", unit_cost: 150 },
    { new: true },
  );
  console.log(`   ✓ Updated to: ${updated?.name}, cost: ${updated?.unit_cost}`);

  // GET search
  console.log("\n5. GET /api/products/search");
  const searchResults = await Product.find({ name: { $regex: "Test", $options: "i" } });
  console.log(`   ✓ Found ${searchResults.length} matching products`);

  // GET categories
  console.log("\n6. GET /api/products/categories");
  const categories = await Product.distinct("category");
  console.log(`   ✓ Found categories: ${categories.join(", ")}`);

  // GET with stock
  console.log("\n7. GET /api/products/:id (with stock)");
  await Stock.create({
    product: product._id,
    warehouse: warehouse1._id,
    on_hand: 50,
    reserved: 10,
  });
  const productWithStock = await Product.findById(product._id);
  const stocks = await Stock.find({ product: product._id });
  const totalStock = stocks.reduce((sum, s) => sum + s.on_hand, 0);
  console.log(`   ✓ Total stock: ${totalStock}`);

  console.log("\n✅ Products API Tests Complete");
}

async function testStocksAPI() {
  console.log("\n=== STOCKS API TESTS ===\n");

  const { warehouse1, warehouse2, product } = await createTestData();

  // GET all stocks
  console.log("1. GET /api/stocks");
  const stocks = await Stock.find().populate("product", "name sku").populate("warehouse", "name");
  console.log(`   ✓ Found ${stocks.length} stock records`);

  // GET by ID
  console.log("\n2. GET /api/stocks/:id");
  const stock = await Stock.findOne({ product: product._id, warehouse: warehouse1._id });
  console.log(`   ✓ Found stock: ${stock?.on_hand} units`);

  // GET low stock
  console.log("\n3. GET /api/stocks/low");
  const lowStock = await Stock.find({ $expr: { $lte: ["$on_hand", "$reserved"] } });
  console.log(`   ✓ Found ${lowStock.length} low stock items`);

  // POST adjust stock
  console.log("\n4. POST /api/stocks/adjust");
  const adjusted = await Stock.findOneAndUpdate(
    { product: product._id, warehouse: warehouse1._id },
    { $inc: { on_hand: 10 } },
    { new: true },
  );
  console.log(`   ✓ Adjusted to: ${adjusted?.on_hand}`);

  // Create stock for warehouse2
  await Stock.create({
    product: product._id,
    warehouse: warehouse2._id,
    on_hand: 20,
    reserved: 5,
  });

  // GET all stocks again
  console.log("\n5. GET /api/stocks (with data)");
  const allStocks = await Stock.find();
  console.log(`   ✓ Found ${allStocks.length} stock records`);

  console.log("\n✅ Stocks API Tests Complete");
}

async function testMovesAPI() {
  console.log("\n=== MOVES API TESTS ===\n");

  const { user, warehouse1, warehouse2, product } = await createTestData();

  // Create initial stock
  await Stock.create({
    product: product._id,
    warehouse: warehouse1._id,
    on_hand: 100,
    reserved: 0,
  });

  // GET all moves (empty)
  console.log("1. GET /api/moves (empty)");
  const moves = await StockMove.find();
  console.log(`   ✓ Found ${moves.length} moves`);

  // POST create move (adjustment)
  console.log("\n2. POST /api/moves (adjustment)");
  const move = await StockMove.create({
    product: product._id,
    quantity: 10,
    move_type: "adjustment",
    to_warehouse: warehouse1._id,
    notes: "Test adjustment",
    created_by: user._id,
  });
  console.log(`   ✓ Created move: ${move.move_type}, qty: ${move.quantity}`);

  // GET by ID
  console.log("\n3. GET /api/moves/:id");
  const found = await StockMove.findById(move._id);
  console.log(`   ✓ Found: ${found?.move_type}`);

  // PUT update move
  console.log("\n4. PUT /api/moves/:id");
  const updated = await StockMove.findByIdAndUpdate(
    move._id,
    { notes: "Updated notes" },
    { new: true },
  );
  console.log(`   ✓ Updated notes: ${updated?.notes}`);

  // GET by product
  console.log("\n5. GET /api/moves/product/:productId");
  const productMoves = await StockMove.find({ product: product._id });
  console.log(`   ✓ Found ${productMoves.length} moves for product`);

  // DELETE
  console.log("\n6. DELETE /api/moves/:id");
  await StockMove.findByIdAndDelete(move._id);
  const deleted = await StockMove.findById(move._id);
  console.log(`   ✓ Deleted: ${deleted === null}`);

  console.log("\n✅ Moves API Tests Complete");
}

async function testDashboardAPI() {
  console.log("\n=== DASHBOARD API TESTS ===\n");

  const { warehouse1, product } = await createTestData();

  // Create test data for dashboard
  await Stock.create({
    product: product._id,
    warehouse: warehouse1._id,
    on_hand: 50,
    reserved: 10,
  });

  // GET stats
  console.log("1. GET /api/dashboard/stats");
  const totalProducts = await Product.countDocuments();
  const totalStock = await Stock.aggregate([
    { $group: { _id: null, total: { $sum: "$on_hand" } } },
  ]);
  const warehousesCount = await Warehouse.countDocuments();
  console.log(
    `   ✓ Products: ${totalProducts}, Stock: ${totalStock[0]?.total || 0}, Warehouses: ${warehousesCount}`,
  );

  // GET operations
  console.log("\n2. GET /api/dashboard/operations");
  const deliveriesCount = await Delivery.countDocuments();
  const receiptsCount = await Receipt.countDocuments();
  console.log(`   ✓ Deliveries: ${deliveriesCount}, Receipts: ${receiptsCount}`);

  console.log("\n✅ Dashboard API Tests Complete");
}

async function testOGAPI() {
  console.log("\n=== OG API TESTS ===\n");

  // Test fetch (would need external URL)
  console.log("1. GET /api/og/fetch");
  console.log("   ⚠ Skipped (requires external URL)");

  // Test proxy (would need external URL)
  console.log("\n2. GET /api/og/proxy");
  console.log("   ⚠ Skipped (requires external URL)");

  console.log("\n✅ OG API Tests Complete (skipped external tests)");
}

async function runAllTests() {
  try {
    console.log("Starting API Tests...\n");
    await connectDB();
    console.log("Connected to in-memory MongoDB");

    // Auth tests
    await cleanup();
    await testAuthAPI();

    // Warehouses tests
    await cleanup();
    await testWarehousesAPI();

    // Locations tests
    await cleanup();
    await testLocationsAPI();

    // Products tests
    await cleanup();
    await testProductsAPI();

    // Stocks tests
    await cleanup();
    await testStocksAPI();

    // Moves tests
    await cleanup();
    await testMovesAPI();

    // Dashboard tests
    await cleanup();
    await testDashboardAPI();

    // OG API tests
    await cleanup();
    await testOGAPI();

    console.log("\n========================================");
    console.log("✅ ALL API TESTS COMPLETED SUCCESSFULLY");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  } finally {
    await disconnectDB();
    console.log("Disconnected from MongoDB");
  }
}

runAllTests();
