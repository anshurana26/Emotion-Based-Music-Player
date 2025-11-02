const express = require("express");
const { User } = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/user/feedback - Get user's liked/disliked tracks
router.get("/feedback", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      likedTracks: user.likedTracks || [],
      dislikedTracks: user.dislikedTracks || [],
    });
  } catch (err) {
    console.error("/feedback GET error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/user/feedback - Like/dislike tracks
router.post("/feedback", async (req, res) => {
  try {
    const { trackId, action } = req.body; // action: 'like' or 'dislike'
    const userId = req.user._id;

    if (!trackId || !action) {
      return res
        .status(400)
        .json({ message: "trackId and action (like/dislike) are required" });
    }

    if (action !== "like" && action !== "dislike") {
      return res.status(400).json({ message: "action must be 'like' or 'dislike'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from opposite list if present
    if (action === "like") {
      user.likedTracks = user.likedTracks.filter((id) => id !== trackId);
      if (!user.likedTracks.includes(trackId)) {
        user.likedTracks.push(trackId);
      }
      user.dislikedTracks = user.dislikedTracks.filter((id) => id !== trackId);
    } else {
      user.dislikedTracks = user.dislikedTracks.filter((id) => id !== trackId);
      if (!user.dislikedTracks.includes(trackId)) {
        user.dislikedTracks.push(trackId);
      }
      user.likedTracks = user.likedTracks.filter((id) => id !== trackId);
    }

    await user.save();

    return res.status(200).json({
      message: `Track ${action}d successfully`,
      likedTracks: user.likedTracks,
      dislikedTracks: user.dislikedTracks,
    });
  } catch (err) {
    console.error("/feedback error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/user/history - Get listening history
router.get("/history", async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, offset = 0, emotion } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let history = user.listeningHistory || [];

    // Filter by emotion if provided
    if (emotion) {
      history = history.filter((entry) => entry.emotion === emotion);
    }

    // Sort by most recent first
    history = history.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

    const total = history.length;
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = history.slice(startIndex, endIndex);

    return res.status(200).json({ 
      history: paginatedHistory,
      total 
    });
  } catch (err) {
    console.error("/history error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/user/history - Add listening history entry
router.post("/history", async (req, res) => {
  try {
    const { trackId, title, artist, emotion, duration, completed } = req.body;
    const userId = req.user._id;

    if (!trackId || !title || !artist || !emotion) {
      return res.status(400).json({
        message: "trackId, title, artist, and emotion are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const historyEntry = {
      trackId,
      title,
      artist,
      emotion,
      playedAt: new Date(),
      duration: duration || 0,
      completed: completed !== undefined ? completed : false,
    };

    user.listeningHistory = user.listeningHistory || [];
    user.listeningHistory.push(historyEntry);

    // Keep only last 1000 entries
    if (user.listeningHistory.length > 1000) {
      user.listeningHistory = user.listeningHistory.slice(-1000);
    }

    await user.save();

    return res.status(200).json({ message: "History entry added", entry: historyEntry });
  } catch (err) {
    console.error("/history POST error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/user/emotion - Log emotion detection
router.post("/emotion", async (req, res) => {
  try {
    const { emotion, confidence, trackId } = req.body;
    const userId = req.user._id;

    if (!emotion) {
      return res.status(400).json({ message: "emotion is required" });
    }

    const validEmotions = ["happy", "sad", "angry", "surprised", "neutral"];
    if (!validEmotions.includes(emotion)) {
      return res.status(400).json({ message: "Invalid emotion" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emotionEntry = {
      emotion,
      confidence: confidence || 0.5,
      trackId: trackId || null,
      timestamp: new Date(),
    };

    user.emotionHistory = user.emotionHistory || [];
    user.emotionHistory.push(emotionEntry);

    // Keep only last 1000 entries
    if (user.emotionHistory.length > 1000) {
      user.emotionHistory = user.emotionHistory.slice(-1000);
    }

    await user.save();

    return res.status(200).json({ message: "Emotion logged", entry: emotionEntry });
  } catch (err) {
    console.error("/emotion error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/user/emotions - Get emotion history for charts
router.get("/emotions", async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "7d" } = req.query; // 7d, 30d, all

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let emotions = user.emotionHistory || [];
    const now = new Date();

    // Filter by period
    if (period === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      emotions = emotions.filter((e) => new Date(e.timestamp) >= sevenDaysAgo);
    } else if (period === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      emotions = emotions.filter((e) => new Date(e.timestamp) >= thirtyDaysAgo);
    }

    // Aggregate emotions by type
    const emotionCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
    };

    emotions.forEach((entry) => {
      if (emotionCounts.hasOwnProperty(entry.emotion)) {
        emotionCounts[entry.emotion]++;
      }
    });

    // Aggregate by day for line chart
    const dailyEmotions = {};
    emotions.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dailyEmotions[dateKey]) {
        dailyEmotions[dateKey] = {
          happy: 0,
          sad: 0,
          angry: 0,
          surprised: 0,
          neutral: 0,
        };
      }
      if (dailyEmotions[dateKey].hasOwnProperty(entry.emotion)) {
        dailyEmotions[dateKey][entry.emotion]++;
      }
    });

    // Convert to array for chart
    const dailyData = Object.entries(dailyEmotions)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      total: emotions.length,
      emotionCounts,
      timelineData: dailyData,
    });
  } catch (err) {
    console.error("/emotions error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put("/preferences", async (req, res) => {
  try {
    const { language, volume, autoPlay, autoVolume, genres } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences
    if (language !== undefined) user.preferences.language = language;
    if (volume !== undefined) {
      if (volume >= 0 && volume <= 1) {
        user.preferences.volume = volume;
      }
    }
    if (autoPlay !== undefined) user.preferences.autoPlay = autoPlay;
    if (autoVolume !== undefined) user.preferences.autoVolume = autoVolume;
    if (genres !== undefined) user.preferences.genres = genres;

    await user.save();

    return res.status(200).json({
      message: "Preferences updated",
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("/preferences PUT error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/user/preferences - Get user preferences
router.get("/preferences", async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      preferences: user.preferences || {
        genres: [],
        volume: 0.7,
        autoPlay: false,
        language: "all",
        autoVolume: true,
      },
      likedTracks: user.likedTracks || [],
      dislikedTracks: user.dislikedTracks || [],
    });
  } catch (err) {
    console.error("/preferences GET error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
