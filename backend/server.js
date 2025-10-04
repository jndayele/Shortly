import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import urlRoutes from "./routes/urlRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import rateLimitMiddleware from "./middleware/rateLimitMiddleware.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate limiting
app.use(rateLimitMiddleware);

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Routes
app.use("/api", urlRoutes);
app.use("/", urlRoutes); // For redirect functionality

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 URL Shortener server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
  console.log(`🗄️ Database: MongoDB`);
});

export default app;
