const mongoose = require("mongoose");

let isConnected = false; // Track the connection state (important for serverless)

async function connectDB() {
  console.log("DEBUG: MONGODB_URI =", process.env.MONGODB_URI);   // ADD THIS LINE

  if (isConnected) return;

  try {
    const uri =
      process.env.MONGODB_URI ||
      "mongodb+srv://gkfweb25_db_user:gkfweb25@cluster0.tyzuxnp.mongodb.net/?appName=Cluster0";

    if (!uri) {
      throw new Error("Missing MONGODB_URI environment variable.");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;

    console.log("MongoDB connected (Netlify Serverless)");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw new Error("Database connection failed");
  }
}

module.exports = connectDB;
