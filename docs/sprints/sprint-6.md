# Sprint 6: Note Persistence, Viewing, Editing & Cloud Storage

## Goal
Implement the end-to-end note lifecycle: saving structured lecture notes to the Supabase PostgreSQL database, uploading resized whiteboard photos to the private Supabase Storage `uploads` bucket, listing notes inside each subject (newest first), viewing full note articles with AI badges and unclear handwriting flags, inline title and point editing with search index updates, and safe note deletion.

## Done
- Created storage helper functions in `src/lib/storageHelpers.js` (`uploadNoteImages`, `deleteNoteImages`, `getNoteSignedImageUrls`) enforcing per-user folder isolation (`<user_id>/<random>.jpg`).
- Implemented `buildSearchText` in `src/lib/searchHelpers.js` and verified with automated unit tests (now 19 frontend unit tests passing).
- Connected note saving in `src/pages/UploadNote.jsx` with Supabase Storage and database persistence.
- Built reusable `NoteCard` component (`src/components/NoteCard.jsx`) displaying lecture date, subject accent bar, summary preview, and photo count badges.
- Enhanced `SubjectDetails` page (`src/pages/SubjectDetails.jsx`) to list notes chronologically (newest first), provide in-subject real-time filtering, and display empty/loading states.
- Built comprehensive `NoteDetails` page (`src/pages/NoteDetails.jsx`):
  - Displays title, lecture date, subject badge, summary, and unclear handwriting warnings.
  - Renders points with soft highlights and `(AI)` badges for textbook-supplemented concepts.
  - Securely fetches and displays signed URLs for uploaded class photos with an interactive lightbox modal.
  - Interactive inline editing mode: students can modify the title and bullet point texts, with automatic recalculation of `search_text`.
  - Delete note action with confirmation modal and cleanup of photos from the storage bucket.
- Registered `/notes/:id` in `src/App.jsx`.

## Not done
- Global keyword search across all notes (scheduled for Milestone 7).
- PDF export using jsPDF (scheduled for Milestone 8).

## What went well
- Seamless integration with Supabase Storage using private signed URLs guarantees zero unauthorized photo access.
- Inline editing allows students to fix typos or rephrase concepts without leaving the note view.
- 19 frontend unit tests and 18 backend unit tests all pass in under 1 second combined.

## What to change
- In Milestone 7, connect the dashboard search box toggle with global multi-subject note queries.
