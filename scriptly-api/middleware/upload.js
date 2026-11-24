import multer from "multer";

// Use memory storage so image bytes are handled in RAM and never written to disk unencrypted
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB max per file
    files: 5,                  // 5 files max
  },
});
