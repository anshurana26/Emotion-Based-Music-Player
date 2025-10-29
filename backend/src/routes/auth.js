const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }
  return secret;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "email, username and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = new User({ email, username });
    user.password = password;
    await user.save();

    const token = jwt.sign({ userId: user._id }, ensureJwtSecret(), {
      expiresIn: "7d",
    });
    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error("/signup error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, ensureJwtSecret(), {
      expiresIn: "7d",
    });
    return res.status(200).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error("/login error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

// Protected routes
router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (err) {
    console.error("/me error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
