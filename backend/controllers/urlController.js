import shortid from "shortid";
import { Url, UserSession } from "../model/urlModel.js";

// Shorten URL
export const shortenUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.headers["x-user-id"];
    const clientIP = req.ip || req.connection.remoteAddress;
    const baseUrl = process.env.BASE_URL;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID missing" });
    }

    // Check if URL already exists for this user
    const existingUrl = await Url.findOne({
      originalUrl: url,
      createdBy: userId,
    });

    if (existingUrl) {
      return res.status(200).json({
        success: true,
        data: {
          id: existingUrl.shortId,
          originalUrl: existingUrl.originalUrl,
          shortUrl: existingUrl.shortUrl,
          createdAt: existingUrl.createdAt,
          clicks: existingUrl.clicks,
        },
        message: "URL already shortened",
      });
    }

    // Generate unique short ID
    let shortId,
      isUnique = false,
      attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortId = shortid.generate();
      const existing = await Url.findOne({ shortId });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate unique short ID",
      });
    }

    // Create new URL document
    const newUrl = new Url({
      shortId,
      originalUrl: url,
      shortUrl: `${baseUrl}/${shortId}`,
      createdBy: userId,
      ipAddress: clientIP,
    });

    await newUrl.save();

    // Update or create user session
    await UserSession.findOneAndUpdate(
      { userId },
      {
        $addToSet: { shortIds: shortId },
        $set: { lastActivity: new Date(), ipAddress: clientIP },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: {
        id: shortId,
        originalUrl: url,
        shortUrl: newUrl.shortUrl,
        createdAt: newUrl.createdAt,
      },
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Redirect to original URL
export const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const urlData = await Url.findOne({ shortId });

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Update statistics atomically
    await Url.findOneAndUpdate(
      { shortId },
      {
        $inc: { clicks: 1 },
        $set: { lastAccessed: new Date() },
      }
    );

    // Redirect to original URL
    res.redirect(301, urlData.originalUrl);
  } catch (error) {
    console.error("Error redirecting URL:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's URL history
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.json({
        success: true,
        count: 0,
        totalPages: 0,
        currentPage: page,
        data: [],
      });
    }

    // Try fetching from UserSession first
    let urls = [];
    let totalCount = 0;

    const userSession = await UserSession.findOne({ userId });

    if (userSession && userSession.shortIds.length > 0) {
      urls = await Url.find({
        shortId: { $in: userSession.shortIds },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("shortId originalUrl shortUrl createdAt clicks lastAccessed");

      totalCount = userSession.shortIds.length;
    }

    // ✅ Fallback: if no session or no shortIds, fetch directly by createdBy
    if (!urls || urls.length === 0) {
      urls = await Url.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("shortId originalUrl shortUrl createdAt clicks lastAccessed");

      totalCount = await Url.countDocuments({ createdBy: userId });
    }

    const totalPages = Math.ceil(totalCount / limit);

    const history = urls.map((url) => ({
      id: url.shortId,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      createdAt: url.createdAt,
      clicks: url.clicks,
      lastAccessed: url.lastAccessed,
    }));

    res.json({
      success: true,
      count: history.length,
      totalCount,
      totalPages,
      currentPage: page,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get URL statistics
export const getUrlStats = async (req, res) => {
  try {
    const { shortId } = req.params;

    const urlData = await Url.findOne({ shortId }).select(
      "shortId originalUrl shortUrl createdAt clicks lastAccessed"
    );

    if (!urlData) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: urlData.shortId,
        originalUrl: urlData.originalUrl,
        shortUrl: urlData.shortUrl,
        createdAt: urlData.createdAt,
        clicks: urlData.clicks,
        lastAccessed: urlData.lastAccessed,
      },
    });
  } catch (error) {
    console.error("Error fetching URL stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a shortened URL (bonus feature)
export const deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userId = req.headers["x-user-id"];
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID missing",
      });
    }

    // Find and delete the URL if it belongs to this user
    const deletedUrl = await Url.findOneAndDelete({
      shortId,
      createdBy: userId,
    });

    if (!deletedUrl) {
      return res.status(404).json({
        success: false,
        message: "URL not found or you do not have permission to delete it",
      });
    }

    // Remove from user session
    await UserSession.findOneAndUpdate(
      { userId },
      { $pull: { shortIds: shortId } }
    );

    res.json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
