import mongoose from "mongoose";

// URL Schema
const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
      maxlength: 2048,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// User Session Schema for tracking user's shortened URLs
const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // ✅ unique per browser/device
      required: true,
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    shortIds: [
      {
        type: String,
        ref: "Url",
      },
    ],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
urlSchema.index({ createdBy: 1, createdAt: -1 });
urlSchema.index({ clicks: -1 });
userSessionSchema.index({ lastActivity: -1 });

// TTL index to automatically delete old unused URLs after 90 days
urlSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    partialFilterExpression: { clicks: 0 }, // Only delete if no clicks
  }
);

// TTL index to automatically delete inactive user sessions after 30 days
userSessionSchema.index(
  { lastActivity: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
  }
);

export const Url = mongoose.model("Url", urlSchema);
export const UserSession = mongoose.model("UserSession", userSessionSchema);
