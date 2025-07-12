const mongoose = require("mongoose");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");

    // Event listeners for connection status
    mongoose.connection.on("disconnected", () =>
      console.log("MongoDB disconnected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("MongoDB error:", err)
    );
    mongoose.connection.on("reconnected", () =>
      console.log("MongoDB reconnected")
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
