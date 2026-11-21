# Testing Row Level Security (RLS) with Two Users

This guide walks you through verifying that **Row Level Security (RLS)** is functioning properly in Supabase. You can perform this test to prove to your examiner that User A cannot see or edit User B's subjects and notes.

---

## What is Row Level Security (RLS)?
> **One-line explanation:** RLS is a database security firewall that checks the identity of the current user (`auth.uid()`) and automatically hides or rejects rows belonging to other people.

---

## Step 1: Create Two Test Users in Supabase
1. Open your **Supabase Dashboard** at [supabase.com](https://supabase.com).
2. Select your Scriptly project.
3. In the left navigation menu, click **Authentication** -> **Users**.
4. Click **Add user** -> **Create user**:
   - **User 1:**
     - Email: `student_a@test.com`
     - Password: `Password123!`
     - Auto Confirm User: **Checked / Yes**
   - **User 2:**
     - Email: `student_b@test.com`
     - Password: `Password123!`
     - Auto Confirm User: **Checked / Yes**
5. Notice that both users have unique `UUID` strings (e.g. `a1b2c3d4-...`).

---

## Step 2: Test via the Supabase SQL Editor

In your Supabase dashboard, click **SQL Editor** -> **New Query**.

### Test 2.1: Simulate User A inserting a subject
Paste and run this query (Supabase lets you simulate an authenticated user with `set local role` and `set local request.jwt.claim.sub`):

```sql
-- Simulate Student A
begin;
set local role authenticated;
set local "request.jwt.claim.sub" to (select id::text from auth.users where email = 'student_a@test.com');

-- Insert a subject for Student A
insert into public.subjects (name, color)
values ('Software Engineering - Student A', '#4f46e5');

-- Read subjects as Student A (Should return 1 row)
select name, color, user_id from public.subjects;
commit;
```
**Expected Result:** You will see `Software Engineering - Student A`.

---

### Test 2.2: Simulate User B reading subjects (RLS Verification)
Now simulate Student B querying the database:

```sql
-- Simulate Student B
begin;
set local role authenticated;
set local "request.jwt.claim.sub" to (select id::text from auth.users where email = 'student_b@test.com');

-- Student B attempts to query all subjects
select * from public.subjects;
commit;
```
**Expected Result:** **0 rows returned!**  
Even though Student A has a subject in the table, Student B cannot see it. PostgreSQL silently filtered it out because `auth.uid() = user_id` evaluated to false.

---

### Test 2.3: Verify Student B cannot tamper with Student A's data
Try modifying Student A's subject while logged in as Student B:

```sql
-- Simulate Student B trying to delete Student A's subject
begin;
set local role authenticated;
set local "request.jwt.claim.sub" to (select id::text from auth.users where email = 'student_b@test.com');

-- Try to delete all rows
delete from public.subjects;

-- Check what was deleted (0 rows)
select count(*) from public.subjects;
commit;
```
**Expected Result:** No rows deleted! Student A's row remains untouched.

---

## Conclusion for Lecturer / Examiner Defence
> *"We implemented PostgreSQL Row Level Security (RLS) on all user-facing tables. Rather than relying solely on frontend logic or backend queries, the database engine itself enforces multi-tenant data isolation. Each query evaluates `auth.uid() = user_id`, guaranteeing zero cross-user data leakage even if API endpoints were bypassed."*
