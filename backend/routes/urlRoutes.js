import express from "express";
import {
  shortenUrl,
  redirectUrl,
  getUserHistory,
  getUrlStats,
  deleteUrl,
} from "../controllers/urlController.js";
import { validateUrl } from "../middleware/validationMiddleware.js";

const router = express.Router();

// POST /api/shorten - Shorten a URL
router.post("/shorten", validateUrl, shortenUrl);

// GET /api/history - Get user's URL history
router.get("/history", getUserHistory);

// GET /api/stats/:shortId - Get statistics for a shortened URL
router.get("/stats/:shortId", getUrlStats);

// DELETE /api/delete/:shortId - Delete a shortened URL
router.delete("/delete/:shortId", deleteUrl);

// GET /:shortId - Redirect to original URL
router.get("/:shortId", redirectUrl);

export default router;
