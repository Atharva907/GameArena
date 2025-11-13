import mongoose from "mongoose";

// Use global caching to prevent multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Return existing connection if available
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  // Create new connection if none exists
  if (!cached.promise) {
    console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI ? "URI provided" : "URI missing");

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, options)
      .then(mongoose => {
        console.log("✅ MongoDB connected successfully to database:", mongoose.connection.name);
        return mongoose;
      })
      .catch(error => {
        console.error("❌ MongoDB connection error:", error);
        cached.promise = null;
        throw new Error("Database connection failed");
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("❌ Error establishing MongoDB connection:", error);
    throw error;
  }
}
