import mongoose from "mongoose";

// Make sure we use the actual MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Log the connection string (with password redacted) for debugging
const logSafeUri = MONGODB_URI.replace(
  /mongodb(\+srv)?:\/\/[^:]+:([^@]+)@/,
  "mongodb$1://[username]:[password]@"
);
console.log(`MongoDB connection string being used: ${logSafeUri}`);

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

let isConnected = false;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    if (!isConnected) {
      console.log("🔄 Using existing MongoDB connection");
      isConnected = true;
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log("🔌 Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  isConnected = true;
  return cached.conn;
}

export default connectToDatabase;
