# Scriptly - AI Usage Log

This log records how artificial intelligence tools were used throughout the development of Scriptly, as required for academic transparency and course evaluation (Module TICT3153 / ICT Expo 5.0).

---

## Milestone 0: Project Setup & Baseline

- **Date:** 2026-11-20
- **What was generated:**
  - Initial repository layout and `.gitignore`.
  - Architecture skeleton in `README.md`.
  - Environment variable templates (`.env.example` files).
  - Basic Express backend server structure with health check route (`/api/health`).
  - Basic Vite + React frontend skeleton with Tailwind CSS setup.
- **What was verified & adapted:**
  - Verified security rules (ensured no real secrets or credentials in repository files).
  - Configured project directories according to the agreed plan.
  - Tested that both frontend and backend start up without runtime errors.

---

## Milestone 1: Database Architecture & Row Level Security

- **Date:** 2026-11-20
- **What was generated:**
  - SQL schema file `docs/schema.sql` covering five core tables (`profiles`, `subjects`, `notes`, `ai_calls`, `timetable_slots`).
  - Row Level Security (RLS) policies enforcing user isolation (`auth.uid() = user_id`).
  - Private Supabase Storage bucket definition for note images.
  - Test guide `docs/testing/rls-test-guide.md` with two-user simulation scripts.
  - Sprint report `docs/sprints/sprint-1.md`.
- **What was verified & adapted:**
  - Verified cascading deletes (`on delete cascade`) so deleting a subject removes its notes cleanly.
  - Ensured `search_text` and `content jsonb` fields match the project requirements.
  - Verified storage object folder policies to isolate user photo folders.

---

## Milestone 2: Supabase Authentication Flow

- **Date:** 2026-11-21
- **What was generated:**
  - Supabase client integration `src/lib/supabase.js`.
  - Authentication Context and Provider `src/context/AuthContext.jsx`.
  - Route guard `src/components/ProtectedRoute.jsx`.
  - Mobile-first responsive login and registration interface `src/pages/Login.jsx`.
  - Header and Logout component `src/components/Navbar.jsx`.
  - Authenticated Dashboard placeholder `src/pages/Dashboard.jsx`.
  - Sprint report `docs/sprints/sprint-2.md`.
- **What was verified & adapted:**
  - Sanitized Supabase project URL parsing to handle trailing slashes or endpoint paths.
  - Enforced 44px minimum touch targets and accessible contrast standards.
  - Verified compilation and production bundle build with zero errors.

---

## Milestone 3: Subject Management Dashboard

- **Date:** 2026-11-22
- **What was generated:**
  - Subject sorting and filtering algorithms in `src/lib/subjectHelpers.js`.
  - Comprehensive unit test suite in `src/lib/subjectHelpers.test.js` using Vitest.
  - Interactive `SubjectCard` component with color stripe, favorite star toggle, and delete action.
  - `AddSubjectModal` with name validation and 8-color picker.
  - `DeleteConfirmModal` with cascade warning.
  - Search filter input in `Navbar`.
  - Upgraded `Dashboard` with live Supabase queries, loading skeleton, and empty states.
  - Route handler and placeholder for `/subjects/:id` in `SubjectDetails.jsx`.
  - Sprint report `docs/sprints/sprint-3.md`.
- **What was verified & adapted:**
  - Verified sorting logic: favorites stay pinned to the top, then sorted alphabetically.
  - Verified event propagation isolation so clicking delete or favorite does not navigate into the subject card.
  - Verified all 8 unit tests pass in Vitest.
  - Checked mobile responsiveness down to 360px viewport.

---

## Milestone 4: Backend AI Endpoint & Rate Limiting

- **Date:** 2026-11-23
- **What was generated:**
  - Prompt construction template `scriptly-api/prompts.js`.
  - Input and JSON shape validator `scriptly-api/utils/validator.js`.
  - Automatic retry helper with backoff `scriptly-api/utils/retry.js`.
  - Supabase JWT token verification and RLS client middleware `scriptly-api/middleware/auth.js`.
  - Multer memory storage upload middleware `scriptly-api/middleware/upload.js`.
  - Google Gemini SDK caller `scriptly-api/utils/gemini.js` with JSON mode and dynamic `GEMINI_MODEL`.
  - Complete 7-step API route `POST /api/notes/structure` in `scriptly-api/routes/notes.js`.
  - Automated Vitest test suite `scriptly-api/tests/backend.test.js` (18 unit tests).
  - Postman API collection `docs/testing/Scriptly_API.postman_collection.json`.
  - Sprint report `docs/sprints/sprint-4.md`.
- **What was verified & adapted:**
  - Guaranteed `GEMINI_MODEL` is retrieved strictly from environment variables without hardcoded fallbacks.
  - Verified step-by-step pipeline ordering to avoid executing AI calls before auth and rate limit verification.
  - Provided `ws` transport option to support Supabase JS on Node.js.
  - Verified all 18 backend unit tests pass in Vitest.

---

## Milestone 5: Note Upload & AI Structuring Interface

- **Date:** 2026-11-24
- **What was generated:**
  - Browser-side HTML5 canvas image resize utility `src/lib/imageResize.js`.
  - Date formatting and weekday calculations `src/lib/dateHelpers.js`.
  - Unit tests for image scaling and date formulas `src/lib/helpers.test.js`.
  - Structured note preview card `src/components/NotePreview.jsx` with AI highlight badges and unclear words alert.
  - Interactive upload page `src/pages/UploadNote.jsx` with camera/gallery inputs, thumbnail strip, and error retention.
  - Quick action upload navigation buttons on dashboard and subject views.
  - Sprint report `docs/sprints/sprint-5.md`.
- **What was verified & adapted:**
  - Verified aspect ratio calculations for landscape, portrait, and square photos.
  - Verified that failed requests keep the user's photos and typed keywords intact.
  - Verified 16 frontend unit tests and 18 backend unit tests all pass.
