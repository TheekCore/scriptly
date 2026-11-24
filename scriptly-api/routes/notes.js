import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateNoteInput } from "../utils/validator.js";
import { structureNoteWithGemini } from "../utils/gemini.js";

const router = Router();

/**
 * POST /api/notes/structure
 * Generates structured lecture notes from uploaded images and/or text using Google Gemini.
 * Follows strict order of execution:
 * 1. Auth check (Bearer token)
 * 2. Rate limit check (max 30 requests per user per day in ai_calls)
 * 3. Input validation
 * 4. Gemini API invocation
 * 5. Schema verification & retries
 * 6. Record call in ai_calls and return 200 JSON
 * 7. Error handling (returns 502 on AI failure, never crashes)
 */
router.post(
  "/notes/structure",
  // Step 1: Check Authorization
  requireAuth,
  // Handle multipart form data with Multer memory storage
  (req, res, next) => {
    upload.array("files", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "BAD_INPUT",
            message: "One or more files exceed the 8 MB size limit.",
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            error: "BAD_INPUT",
            message: "Too many files uploaded. Maximum is 5 images.",
          });
        }
        return res.status(400).json({
          error: "BAD_INPUT",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: "BAD_INPUT",
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      // Step 2: Rate limit check (Max 30 AI requests per user per day)
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const { count, error: countError } = await req.userSupabase
        .from("ai_calls")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfToday.toISOString());

      if (countError) {
        console.error("Failed to query ai_calls quota:", countError.message);
        // If quota check table fails, allow through or handle gracefully
      } else if (typeof count === "number" && count >= 30) {
        return res.status(429).json({
          error: "DAILY_LIMIT",
          message: "Daily AI limit reached. Try again tomorrow.",
        });
      }

      // Step 3: Input validation
      const files = req.files || [];
      const text = req.body?.text || "";
      const subject = req.body?.subject || "General";

      const validation = validateNoteInput(files, text);
      if (!validation.valid) {
        return res.status(400).json({
          error: "BAD_INPUT",
          message: validation.error,
        });
      }

      // Step 4 & 5: Call Gemini with low temperature and retry
      let structuredJson;
      try {
        structuredJson = await structureNoteWithGemini({
          files,
          subject,
          text,
        });
      } catch (aiErr) {
        console.error("Gemini AI generation failed after retries:", aiErr.message);
        // Step 7: AI failed
        return res.status(502).json({
          error: "AI_FAILED",
          message: "The AI service was unable to structure your note. Please try again.",
        });
      }

      // Step 6: Insert one row into ai_calls and return JSON
      try {
        await req.userSupabase.from("ai_calls").insert([
          {
            user_id: req.user.id,
          },
        ]);
      } catch (logErr) {
        console.warn("Could not record ai_calls log entry:", logErr.message);
      }

      return res.status(200).json(structuredJson);
    } catch (unexpectedErr) {
      console.error("Unexpected server error:", unexpectedErr.message);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "An unexpected server error occurred.",
      });
    }
  }
);

export default router;
