// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Bhakti12:12345678a@cluster.hozl3.mongodb.net/score?retryWrites=true&w=majority&appName=Cluster", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("MongoDB Connected"))
//   .catch(err => console.error("MongoDB Connection Failed", err));

// // 🎮 Player Schema
// const PlayerSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   lives: { type: Number, default: 10 },
//   level: { type: Number, default: 1 },
//   score: { type: Number, default: 0 },
// });

// const Player = mongoose.model("Player", PlayerSchema);

// // 🏆 Score Schema
// const ScoreSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   score: { type: Number, required: true },
//   date: { type: Date, default: Date.now },
// });

// const Score = mongoose.model("Score", ScoreSchema);

// // 🎮 Register or Update Player
// app.post("/api/player", async (req, res) => {
//   const { username } = req.body;
//   let player = await Player.findOne({ username });

//   if (!player) {
//     player = new Player({ username });
//     await player.save();
//   }

//   res.json(player);
// });

// // ❤️ Update Lives
// app.post("/api/update-lives", async (req, res) => {
//   const { username, lives } = req.body;
//   await Player.updateOne({ username }, { lives });
//   res.json({ message: "Lives updated!" });
// });

// // 🏆 Save Score
// app.post("/api/save-score", async (req, res) => {
//   const { username, score } = req.body;
//   const newScore = new Score({ username, score });
//   await newScore.save();
//   res.json({ message: "Score saved!" });
// });

// // 📊 Get Leaderboard (Top 10 Scores)
// app.get("/api/leaderboard", async (req, res) => {
//   const scores = await Score.find().sort({ score: -1 }).limit(10);
//   res.json(scores);
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://Bhakti12:12345678a@cluster.hozl3.mongodb.net/score?retryWrites=true&w=majority&appName=Cluster", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const leaderboardSchema = new mongoose.Schema({
  username: String,
  score: Number,
  date: { type: Date, default: Date.now },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// ✅ Save player score
app.post("/save-score", async (req, res) => {
  const { username, score } = req.body;

  if (!username || !score) {
    return res.status(400).json({ error: "Username and score are required" });
  }

  try {
    const newEntry = new Leaderboard({ username, score });
    await newEntry.save();
    res.json({ message: "Score saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Fetch top 10 leaderboard scores
app.get("/leaderboard", async (req, res) => {
  try {
    const topScores = await Leaderboard.find().sort({ score: -1 }).limit(10);
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
