const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load User model
const User = mongoose.model("User", require("../models/userModel")); // Assuming a separate model file

// Register Route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", { username, password });
  try {
    const user = await User.findOne({ username });
    console.log("Found user:", user);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (isMatch) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "secretkey"
      );
      console.log("Generated token:", token);
      return res.json({ token });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
