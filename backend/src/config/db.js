const mongoose = require("mongoose");

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("Connected to MongoDB");
}

module.exports = { connectToDatabase };

