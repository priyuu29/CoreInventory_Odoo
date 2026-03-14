import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[DB] MONGODB_URI is not defined in environment variables");
  throw new Error("Please define MONGODB_URI in .env.local");
}

console.log("[DB] MongoDB URI configured:", MONGODB_URI.replace(/\/\/.*:.*@/, "//****:****@"));

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongoose || { conn: null, promise: null };

if (!globalForMongoose.mongoose) {
  console.log("[DB] Initializing global mongoose cache");
  globalForMongoose.mongoose = cached;
}

async function connectDB() {
  // Return cached connection if exists
  if (cached.conn) {
    console.log("[DB] Using existing connection");
    return cached.conn;
  }

  // Create new connection if promise doesn't exist
  if (!cached.promise) {
    console.log("[DB] Creating new MongoDB connection...");

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
        console.log("[DB] MongoDB connected successfully");
        return mongoose;
      });
    } catch (error) {
      console.error("[DB] Error creating MongoDB connection:", error);
      cached.promise = null;
      throw error;
    }
  }

  try {
    console.log("[DB] Waiting for connection...");
    cached.conn = await cached.promise;
    console.log("[DB] Connection established, state:", mongoose.connection.readyState);
  } catch (error) {
    console.error("[DB] Connection failed:", error);
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

// Log connection events
mongoose.connection.on("connected", () => {
  console.log("[DB] Mongoose connected event fired");
});

mongoose.connection.on("error", (err) => {
  console.error("[DB] Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("[DB] Mongoose disconnected event fired");
});

export default connectDB;
