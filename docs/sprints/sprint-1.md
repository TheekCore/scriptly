# Sprint 1: Database Architecture & Row Level Security

## Goal
Design and deploy the relational PostgreSQL schema in Supabase with strict Row Level Security (RLS) policies, automatic profile synchronization, and secure storage bucket rules.

## Done
- Created `docs/schema.sql` defining 5 relational tables:
  1. `profiles`: User information connected to `auth.users`.
  2. `subjects`: Academic subjects with custom colors and favorite flags.
  3. `notes`: Structured lecture notes with JSONB content and optimized `search_text`.
  4. `ai_calls`: Request log tracking the 30 daily AI structuring quota.
  5. `timetable_slots`: Lecture schedule slots for upcoming lecture calculations.
- Configured PostgreSQL Row Level Security (RLS) on all tables with `own` policies (`auth.uid() = user_id`).
- Implemented `handle_new_user` trigger to automatically generate user profiles on signup.
- Configured private Supabase Storage bucket `uploads` restricted by folder path (`<user_id>/...`).
- Authored `docs/testing/rls-test-guide.md` with reproducible SQL commands to test RLS multi-tenancy with two users.

## Not done
- Frontend authentication context and login UI (scheduled for Milestone 2).
- Subject dashboard UI (scheduled for Milestone 3).

## What went well
- Database schema supports both current core requirements and future stretch goals without needing breaking migrations.
- RLS ensures security is enforced at the database level rather than trusting client-side logic.

## What to change
- Ensure environment variables (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) are properly populated in `.env` before starting Milestone 2.
