const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmotionEntrySchema = new mongoose.Schema(
  {
    emotion: {
      type: String,
      enum: ["happy", "sad", "angry", "surprised", "neutral"],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 1 },
    trackId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PlaylistItemSchema = new mongoose.Schema(
  {
    trackId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    emotion: {
      type: String,
      enum: ["happy", "sad", "angry", "surprised", "neutral"],
      required: true,
    },
    path: { type: String },
    cover: { type: String },
  },
  { _id: false }
);

const PlaylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tracks: { type: [PlaylistItemSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PreferencesSchema = new mongoose.Schema(
  {
    genres: { type: [String], default: [] },
    volume: { type: Number, min: 0, max: 1, default: 0.7 },
    autoPlay: { type: Boolean, default: false },
    language: { type: String, default: "all" },
    autoVolume: { type: Boolean, default: true },
  },
  { _id: false }
);

const ListeningHistorySchema = new mongoose.Schema(
  {
    trackId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    emotion: {
      type: String,
      enum: ["happy", "sad", "angry", "surprised", "neutral"],
      required: true,
    },
    playedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }, // in seconds
    completed: { type: Boolean, default: false }, // true if played fully, false if skipped
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /[^@\s]+@[^@\s]+\.[^@\s]+/,
    },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    emotionHistory: { type: [EmotionEntrySchema], default: [] },
    playlists: { type: [PlaylistSchema], default: [] },
    likedTracks: { type: [String], default: [] }, // Array of trackIds
    dislikedTracks: { type: [String], default: [] }, // Array of trackIds
    listeningHistory: { type: [ListeningHistorySchema], default: [] },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

// Virtual password setter
UserSchema.virtual("password")
  .set(function (plainTextPassword) {
    this._password = plainTextPassword;
  })
  .get(function () {
    return this._password;
  });

// Ensure passwordHash exists before validation if virtual password provided
UserSchema.pre("validate", async function (next) {
  try {
    if (this._password && !this.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this._password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = { User };
