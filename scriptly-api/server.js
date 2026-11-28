import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import notesRouter from "./routes/notes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const webOrigin = process.env.WEB_ORIGIN || "http://localhost:5173";

// Restrict CORS to allow requests from our frontend, localhost, and local network devices
const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://172.") ||
        origin.startsWith("http://10.")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Limit JSON payload size to prevent denial-of-service from massive request bodies
app.use(express.json({ limit: "1mb" }));

// Mount routes
app.use("/api", healthRouter);
app.use("/api", notesRouter);

// Start listening if run directly (not when imported in unit tests)
if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Scriptly API listening at http://localhost:${port}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")} + local network`);
  });
}

export default app;
