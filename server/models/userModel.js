const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  content: [{ title: String, text: String, version: Number, createdAt: Date }],
});

module.exports = userSchema;
