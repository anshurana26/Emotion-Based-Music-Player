const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectToDatabase } = require("./src/config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", require("./src/routes/auth"));

// Start server (connect DB if URI present)
const port = process.env.PORT || 5000;
if (process.env.MONGODB_URI) {
  connectToDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Backend server listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error(
        "Failed to start server due to DB connection error:",
        error
      );
      process.exit(1);
    });
} else {
  console.warn(
    "MONGODB_URI not set. Starting server without database connection."
  );
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}
