import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { listingsRouter } from "./routes/listings";
import { inquiriesRouter } from "./routes/inquiries";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhakaspace";

app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "DhakaSpace API",
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Routes
app.use("/api/listings", listingsRouter);
app.use("/api/inquiries", inquiriesRouter);

// Centralized Error Handling Middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource identifier" });
  }
  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ success: false, message: errorMessage });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 DhakaSpace Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
