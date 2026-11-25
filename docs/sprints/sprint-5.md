# Sprint 5: Note Upload & AI Structuring Interface

## Goal
Build the multimodal note upload interface: camera photo capture and gallery image selection (up to 5 images), lecture date selection, subject dropdown, client-side HTML5 canvas image resizing (max 1600px, 0.85 JPEG), optional typed keywords/text box, integration with the backend `POST /api/notes/structure` endpoint, and structured note preview rendering with AI-added badges and unclear word flags.

## Done
- Implemented `calculateTargetDimensions` and `resizeImage` in `src/lib/imageResize.js` for browser-side canvas image optimization.
- Implemented `getTodayDateString`, `formatDisplayDate`, and `getWeekdayNumber` in `src/lib/dateHelpers.js`.
- Authored 8 automated unit tests for dimension scaling and date helpers in `src/lib/helpers.test.js`.
- Created interactive `NotePreview` (`src/components/NotePreview.jsx`) highlighting textbook-supplemented points (`ai_added: true`), providing an educational legend, and displaying unreadable words in a yellow warning box.
- Built full `/upload` page (`src/pages/UploadNote.jsx`):
  - Preselects subject when linked from subject details (`?subjectId=...`).
  - Native camera capture (`capture="environment"`) and gallery picker with multi-selection.
  - Image thumbnail strip with individual delete buttons and visual counter (`3/5 photos`).
  - 5000-character counter for optional typed notes.
  - Informative progress messages during image compression and AI structuring.
  - Resilient error handling: if the AI call fails or daily quota is exceeded, all user inputs are retained without data loss.
- Added "Upload Notes" quick navigation buttons on both the main dashboard and the subject details view.

## Not done
- Supabase storage uploads for images and persistent note saving/editing/deleting (scheduled for Milestone 6).
- Full-text keyword search across notes (scheduled for Milestone 7).

## What went well
- Browser-side canvas resizing ensures huge 15MB phone photos are compressed to ~300KB before network transmission, preventing payload crashes.
- Clean separation between form capture view and `NotePreview` component.
- All 16 frontend unit tests and 18 backend unit tests pass in under 1 second combined.

## What to change
- In Milestone 6, connect note saving with the private Supabase Storage `uploads` bucket.
