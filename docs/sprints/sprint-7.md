# Sprint 7: Full-Text Keyword Search

## Goal
Implement universal keyword search across all lecture notes and within individual subjects, leveraging the normalized `search_text` column in Supabase with PostgreSQL `ilike` pattern matching and responsive UI toggles.

## Done
- Enhanced `src/lib/searchHelpers.js` with `filterNotesByKeyword` supporting multi-word AND search logic.
- Authored 5 new automated unit tests in `src/lib/searchHelpers.test.js` (now 24 frontend tests passing).
- Upgraded `Navbar` (`src/components/Navbar.jsx`) with a responsive "Search notes" toggle pill button and dynamic placeholder.
- Upgraded `Dashboard` (`src/pages/Dashboard.jsx`):
  - Added "Global Note Search" mode toggle.
  - Implemented debounced Supabase `ilike` query joining notes with subjects (`*, subjects(name, color)`).
  - Displays matching note cards with subject name badges, lecture dates, and summaries.
  - Added empty states for active searches with no matches and empty search prompts.
- Enhanced `NoteCard` (`src/components/NoteCard.jsx`) to display the subject name and colored dot indicator during global search results.
- Verified in-subject search filtering in `SubjectDetails.jsx`.

## Not done
- PDF note export with custom styling and `(AI)` markers (scheduled for Milestone 8).
- Progressive Web App (PWA) manifest and service worker (scheduled for Milestone 8).

## What went well
- Leveraging PostgreSQL's `ilike` on the pre-computed `search_text` column delivers instant multi-field searches without complex server configuration.
- Seamless toggle allows students to switch between subject organization and cross-subject keyword research in one click.
- 24 frontend unit tests and 18 backend unit tests pass in under 1 second combined.

## What to change
- In Milestone 8, implement the client-side `jsPDF` generator for exportable notes.
