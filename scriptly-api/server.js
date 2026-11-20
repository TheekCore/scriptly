import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const webOrigin = process.env.WEB_ORIGIN || "http://localhost:5173";

// Restrict CORS to only allow requests from our frontend
app.use(
  cors({
    origin: webOrigin,
    credentials: true,
  })
);

// Limit JSON payload size to prevent denial-of-service from massive request bodies
app.use(express.json({ limit: "1mb" }));

// Mount routes
app.use("/api", healthRouter);

// Start listening if run directly (not when imported in unit tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Scriptly API listening at http://localhost:${port}`);
    console.log(`Allowed CORS origin: ${webOrigin}`);
  });
}

export default app;
