import mongoose from "mongoose";

let isConnected = false; // track connection state

export async function connectDB() {
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return mongoose.connection;
  }

  try {
    console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI ? "URI provided" : "URI missing");
    
    // Options for the connection
    const options = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    // Connect to MongoDB using the URI from environment variables
    // Note: Not specifying dbName since it's already in the URI
    const db = await mongoose.connect(process.env.MONGODB_URI, options);
    
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully to database:", db.connection.name);
    console.log("Connection state:", db.connections[0].readyState);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Database connection failed");
  }
}

// Optional alias for backward compatibility
export const connectToDatabase = connectDB;
