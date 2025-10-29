const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }
  return secret;
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    let payload;
    try {
      payload = jwt.verify(token, ensureJwtSecret());
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("auth middleware error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { authMiddleware };
