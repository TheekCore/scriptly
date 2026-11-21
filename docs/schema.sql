-- ==============================================================================
-- Scriptly - Database Schema & Security Policies
-- Platform: Supabase (PostgreSQL)
-- Module: TICT3153 / ICT Expo 5.0
-- ==============================================================================

-- 1. PROFILES TABLE
-- Stores extra public details for each authenticated student.
-- Tied directly to Supabase Auth (auth.users) with cascading delete.
create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 2. SUBJECTS TABLE
-- Stores academic subjects created by students (e.g., Mathematics, Software Eng).
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  color text default '#6366f1',
  is_favourite boolean default false,
  created_at timestamptz default now()
);

-- 3. NOTES TABLE
-- Stores structured lecture notes created from photos and/or typed text.
-- 'content' is stored as JSONB to keep sections, points, and tags flexible.
-- 'search_text' stores a lowercase combined string for fast keyword search.
-- 'image_paths' stores array of relative paths in Supabase Storage.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject_id uuid not null references public.subjects on delete cascade,
  lecture_date date not null default current_date,
  title text,
  raw_text text,
  content jsonb,
  search_text text,
  image_paths text[] default '{}',
  created_at timestamptz default now()
);

-- 4. AI_CALLS TABLE
-- Tracks when a student requests AI structuring to enforce the 30 requests/day limit.
create table if not exists public.ai_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz default now()
);

-- 5. TIMETABLE_SLOTS TABLE (Prepared for Stretch Goal)
-- Stores lecture schedules to compute upcoming subjects.
-- Weekday numbering: Monday = 0, Tuesday = 1, ..., Sunday = 6.
create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject_id uuid references public.subjects on delete cascade,
  weekday smallint check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Crucial rule: guarantees that a student can ONLY see and edit their own data.
-- ==============================================================================

-- Enable RLS on all five tables
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.notes enable row level security;
alter table public.ai_calls enable row level security;
alter table public.timetable_slots enable row level security;

-- Drop existing policies if rerun to prevent duplicate errors
drop policy if exists "own" on public.profiles;
drop policy if exists "own" on public.subjects;
drop policy if exists "own" on public.notes;
drop policy if exists "own" on public.ai_calls;
drop policy if exists "own" on public.timetable_slots;

-- Create policy "own" for all operations (SELECT, INSERT, UPDATE, DELETE)
create policy "own" on public.profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own" on public.subjects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own" on public.notes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own" on public.ai_calls
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own" on public.timetable_slots
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Automatically creates a profile record when a new user registers via Supabase Auth
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- STORAGE CONFIGURATION
-- Private bucket 'uploads' where photos are saved at: <user_id>/<random>.jpg
-- ==============================================================================

-- Create the private bucket 'uploads' if it does not already exist
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- Drop storage policy if rerun
drop policy if exists "Users own upload files" on storage.objects;

-- Storage Policy: Users can only upload, read, and delete within their own folder (<user_id>/...)
create policy "Users own upload files"
on storage.objects for all
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
