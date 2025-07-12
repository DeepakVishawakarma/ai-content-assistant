require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const PORT = 5001;

app.use(
  cors({
    origin: "*", // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow headers
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Load routes
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");

// Use routes with prefix
app.use("/api", authRoutes);
app.use("/api", contentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
