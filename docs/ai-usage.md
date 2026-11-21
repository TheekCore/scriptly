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
