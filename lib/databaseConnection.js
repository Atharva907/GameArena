import mongoose from "mongoose";

let isConnected = false; // track connection state

export async function connectDB() {
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // 检查实际连接状态，而不仅仅是标志位
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    isConnected = true;
    return mongoose.connection;
  }

  try {
    console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI ? "URI provided" : "URI missing");
    
    // Options for the connection (移除过时选项)
    const options = {
      bufferCommands: true, // 改为true以允许缓冲命令
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // 增加超时时间
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // 添加重试逻辑
      retryWrites: true,
      w: 'majority'
    };
    
    // Connect to MongoDB using the URI from environment variables
    // Note: Not specifying dbName since it's already in the URI
    await mongoose.connect(process.env.MONGODB_URI, options);

    // 等待连接完全建立
    await new Promise(resolve => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully to database:", mongoose.connection.name);
    console.log("Connection state:", mongoose.connection.readyState);
    return mongoose.connection;
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
