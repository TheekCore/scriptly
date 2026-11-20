# Scriptly 📝✨

> **Smart, structured lecture notes from rough photos and quick keywords.**  
> Built as a Progressive Web App (PWA) for university students.  
> Project for Software Engineering Module **TICT3153** (ICT Expo 5.0).

---

## 1. Project Description
**Scriptly** is a responsive Progressive Web App designed to solve a universal student problem: messy, rushed lecture notes. During fast-paced lectures, students frequently snap photos of slides or whiteboards and jot down disjointed keywords. Scriptly processes these inputs through an AI-powered pipeline, structuring them into comprehensive, organized notes categorized by subject.

---

## 2. Core Features
- **Authentication**: Secure email and password login powered by Supabase Auth with Row Level Security.
- **Subject Dashboard**: Organize notes by subject, assign custom colors, mark favorites, and filter dynamically.
- **Multimodal Note Upload**: Capture photos directly via camera or gallery (up to 5 images), add optional text keywords, with automatic client-side image compression.
- **AI Structuring Pipeline**: Transforms messy notes into a structured format featuring title, summary, key sections, highlighted AI-supplemented textbook facts (`ai_added: true`), and flagged unreadable words.
- **Searchable Notes**: Full-text keyword search across all notes or filtered by subject.
- **PDF Export**: Generate professional, clean PDF lecture notes with clear visual tags on AI-supplemented content.
- **Daily Quota Protection**: Built-in 30 requests/day limit per student to promote sustainable usage.
- **Installable PWA**: Works across Windows, Android, and iOS browsers with offline shell caching.

---

## 3. Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, `react-router-dom`, `@supabase/supabase-js`, `jspdf`.
- **Backend**: Node.js, Express (ES modules), `multer`, `@google/genai` (Google Gemini API), `@supabase/supabase-js`, `cors`, `dotenv`.
- **Database & Storage**: Supabase (PostgreSQL with Row Level Security, Supabase Auth, Supabase Storage).
- **AI Model**: Google Gemini API via official `@google/genai` SDK (`GEMINI_MODEL` environment variable).
- **Testing**: Vitest (Unit Testing), Postman Collection (API Testing).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 4. Architecture Diagram
```text
+-------------------------------------------------------------+
|                      Scriptly Frontend                       |
|           (React + Vite + Tailwind PWA on Vercel)           |
|                                                             |
|  - Auth State (Supabase Auth Client)                        |
|  - Canvas Image Compressor (1600px JPEG)                    |
|  - Offline App Shell (Service Worker & Manifest)            |
+------------------------------+------------------------------+
                               |
                   HTTPS Calls | (Bearer JWT)
                               v
+-------------------------------------------------------------+
|                      Scriptly Backend                       |
|                 (Node.js + Express on Render)               |
|                                                             |
|  - Token Verification (Supabase Auth)                       |
|  - Daily Limit Guard (<= 30 calls/day in ai_calls table)    |
|  - Input Validation (multer memory, max 8MB, jpg/png/webp)  |
|  - Gemini AI Prompt Engine (@google/genai, JSON mode)       |
+--------------+------------------------------+---------------+
               |                              |
               v                              v
+-------------------------------+ +---------------------------+
|          Supabase             | |      Google Gemini API    |
|  - PostgreSQL with RLS        | |  (gemini-2.5-flash)       |
|  - Private 'uploads' Bucket   | |  - Multimodal Vision      |
|  - Auth Service               | |  - Structured JSON Output |
+-------------------------------+ +---------------------------+
```

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js (v18 or v20 LTS recommended)
- Git
- A Supabase account (free tier)
- A Google AI Studio account (free Gemini API key)

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/scriptly.git
cd scriptly
```

### Step 2: Configure Environment Variables
Copy the `.env.example` templates to `.env` in both backend and frontend directories:

**Backend (`scriptly-api/.env`):**
```env
PORT=3000
WEB_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**Frontend (`scriptly-web/.env`):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3000
```

### Step 3: Run the Backend
```bash
cd scriptly-api
npm install
npm run dev
```
Health check endpoint: `http://localhost:3000/api/health`

### Step 4: Run the Frontend
```bash
cd ../scriptly-web
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 6. Supabase Database Setup
1. Create a new project in your Supabase dashboard.
2. Open the **SQL Editor** in Supabase.
3. Open `docs/schema.sql` from this repository, paste the contents, and click **Run**.
4. Create a private storage bucket named `uploads`.

---

## 7. AI Usage Statement
- **Runtime AI**: Google Gemini API is integrated exclusively on the backend to transcribe and structure messy notes and add verified textbook context.
- **Development Assistance**: Antigravity (Google DeepMind) was used as an interactive programming teacher and full-stack engineering guide. Every line of code, architectural choice, and security policy was reviewed and verified.

---

## 8. Limitations & Future Work
- Offline usage currently allows cached viewing; note generation requires an active internet connection to communicate with the Gemini API.
- Hand-drawn diagrams or equations are extracted as descriptive text rather than vector graphics.
- Future enhancements (planned stretch goals): Lecture timetable slots with reminders 7 minutes after a class ends.
