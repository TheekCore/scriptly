# Sprint 3: Subject Management Dashboard

## Goal
Implement the core subject dashboard: creating subjects with custom colors, deleting subjects with confirmation, toggling favorite status, sorting favorites to the top, and filtering subjects via search.

## Done
- Created pure helper functions `sortSubjects` and `filterSubjects` in `src/lib/subjectHelpers.js`.
- Implemented unit tests for subject sorting and filtering using Vitest (8 unit tests passing).
- Built responsive, interactive `SubjectCard` (`src/components/SubjectCard.jsx`) with color stripe, note counter, favorite star toggle, and delete trigger.
- Implemented `AddSubjectModal` (`src/components/AddSubjectModal.jsx`) featuring name validation and a curated 8-color palette.
- Implemented `DeleteConfirmModal` (`src/components/DeleteConfirmModal.jsx`) warning students about cascading deletion of lecture notes.
- Integrated dynamic search box into `Navbar` for real-time subject filtering.
- Upgraded `Dashboard` (`src/pages/Dashboard.jsx`) with full loading skeleton, empty states ("No subjects yet" and "No matching subjects"), and live Supabase queries.
- Created `SubjectDetails` placeholder (`src/pages/SubjectDetails.jsx`) connected to `/subjects/:id`.

## Not done
- Backend AI structuring endpoint (scheduled for Milestone 4).
- Note upload and image capture (scheduled for Milestone 5).

## What went well
- Pure helper functions decoupled sorting logic from React components, enabling fast and isolated unit tests.
- Optimistic UI updates on the favorite star toggle make the interface feel instantaneous.
- Accessible keyboard shortcuts (Enter, Space, Escape) and minimum 44px touch targets ensure strong usability on mobile devices.

## What to change
- Prepare backend Gemini API key and prompt templates for Milestone 4.
