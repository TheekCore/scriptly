# Sprint 0: Project Setup & Baseline

## Goal
Set up the workspace, directory layout, version control rules, environment templates, documentation baseline, and minimal running skeletons for both the frontend (Vite + React) and backend (Express health route).

## Done
- Initialized root project structure and comprehensive `.gitignore` preventing secret leaks.
- Drafted project architecture and technical setup in `README.md`.
- Created `.env.example` templates for both `scriptly-api` and `scriptly-web`.
- Initialized `docs/ai-usage.md` log for academic integrity tracking.
- Set up backend with Node.js ES modules, Express, CORS, and an unauthenticated `GET /api/health` route.
- Set up frontend with Vite, React, and Tailwind CSS rendering a baseline "Hello Scriptly" interface.

## Not done
- Database schema and RLS policies (scheduled for Milestone 1).
- Supabase authentication flow (scheduled for Milestone 2).

## What went well
- Clean separation between frontend client and backend API.
- Strict security boundaries established early: API keys and secrets stay out of version control.

## What to change
- Ensure all future terminal commands explicitly include the local Node.js path if needed in temporary sessions.
