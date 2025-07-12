const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
// Load User model
const User = mongoose.model("User", require("../models/userModel"));
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Generate Content Route
router.post("/generate", async (req, res) => {
  const { topic, tone, type } = req.body;
  const ollamaUrl = process.env.REACT_APP_OLLAMA_BASE_URL + "/api/generate";
  const prompt = `Generate a ${type} about ${topic} with a ${tone} tone`;
  try {
    const response = await axios.post(
      ollamaUrl,
      {
        model: "llama3:8b",
        prompt: prompt,
        max_tokens: 50,
        stream: true, // Enable streaming
      },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "text/plain");
    response.data.on("data", (chunk) => {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim());
      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.response) res.write(data.response); // Stream each chunk
      }
    });
    response.data.on("end", () => res.end());
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Ollama server is not running or unreachable at",
        ollamaUrl
      );
    } else if (error.response) {
      console.error(
        "Ollama API error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Unknown error:", error.message);
    }
    res
      .status(500)
      .json({ error: "Content generation failed", details: error.message });
  }
});

// Save Content Route
router.post("/save", async (req, res) => {
  const { token, title, text } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
  const user = await User.findById(decoded.id);
  const version = user.content.length + 1;
  user.content.push({ title, text, version, createdAt: new Date() });
  await user.save();
  res.json({ message: "Content saved" });
});

// Get Content History Route
router.get("/history", async (req, res) => {
  const { token } = req.headers;
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
  const user = await User.findById(decoded.id);
  res.json(user.content);
});

module.exports = router;
