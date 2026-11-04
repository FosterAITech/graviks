import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,        // ⚡ Increase concurrent connections for better performance
      minPoolSize: 10,        // Keep minimum connections alive
      maxIdleTimeMS: 45000,   // Close idle connections after 45 seconds
      socketTimeoutMS: 45000, // Timeout long-running operations
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("DB Error:", error.message);
    return false;
  }
};

export default connectDB;
