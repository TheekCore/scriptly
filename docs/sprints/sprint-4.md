# Sprint 4: Backend AI Structuring Endpoint & Rate Limiting

## Goal
Implement the core backend AI pipeline (`POST /api/notes/structure`): verify Supabase bearer tokens, enforce the 30-calls/day rate limit against `ai_calls`, validate files and text, execute multimodal note structuring using the official Google Gemini SDK (`@google/genai`) with low temperature and JSON output mode, implement automatic retry backoff, and write unit tests and a Postman collection.

## Done
- Created prompt generator `scriptly-api/prompts.js` inserting subject context and raw text into standard textbook structuring instructions.
- Implemented `validateNoteInput` and `validateNoteJsonShape` in `scriptly-api/utils/validator.js` verifying MIME types (JPG/PNG/WEBP), maximum 5 files, 8 MB per file limit, and 5000 character limit.
- Implemented `withRetry` helper (`scriptly-api/utils/retry.js`) supporting exponential backoff (1.5s then 3s delays).
- Configured `requireAuth` middleware (`scriptly-api/middleware/auth.js`) validating Supabase JWTs and instantiating an RLS-scoped user client.
- Configured `upload` middleware (`scriptly-api/middleware/upload.js`) with multer in-memory storage.
- Implemented `structureNoteWithGemini` (`scriptly-api/utils/gemini.js`) using `@google/genai` with `GEMINI_MODEL`, `temperature: 0.2`, and `responseMimeType: "application/json"`.
- Built `POST /api/notes/structure` route (`scriptly-api/routes/notes.js`) adhering to the 7-step sequence (Auth -> Quota check -> Validation -> Gemini -> Verification/Retry -> Log to `ai_calls` -> Return JSON).
- Authored 18 automated unit tests in `scriptly-api/tests/backend.test.js` covering input validation, shape verification, prompt formatting, and retry mechanics.
- Authored complete Postman collection `docs/testing/Scriptly_API.postman_collection.json`.

## Not done
- Upload page UI with camera, gallery, and client-side canvas resizing (scheduled for Milestone 5).
- Note saving, viewing, and inline editing (scheduled for Milestone 6).

## What went well
- Strict 7-step ordering guarantees no unauthorized requests ever reach the paid/quota-limited Gemini API.
- In-memory file processing ensures sensitive student photos are never written to unencrypted backend disk storage.
- 18 backend unit tests pass in under 200ms.

## What to change
- In Milestone 5, ensure frontend canvas resizes images before sending multipart form data to save mobile bandwidth.
