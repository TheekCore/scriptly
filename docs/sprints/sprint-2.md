# Sprint 2: Authentication & Route Protection

## Goal
Implement client-side authentication using Supabase Auth with session persistence, user registration, login, logout, and protected routing.

## Done
- Initialized Supabase client in `src/lib/supabase.js` with defensive URL handling.
- Built `AuthContext` (`src/context/AuthContext.jsx`) managing session state, listening to auth changes, and providing `signIn`, `signUp`, and `signOut`.
- Implemented `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) to guard internal pages and redirect unauthenticated visitors to `/login`.
- Created accessible, mobile-first `Login` page (`src/pages/Login.jsx`) supporting both sign-in and sign-up with clear error messaging.
- Added sticky `Navbar` (`src/components/Navbar.jsx`) with user email badge and one-click logout.
- Created `Dashboard` (`src/pages/Dashboard.jsx`) to confirm successful authentication.
- Configured client routing in `App.jsx` with `react-router-dom`.

## Not done
- Subject dashboard with color selection, deletion, favorites, and search (scheduled for Milestone 3).
- Backend AI structuring endpoint (scheduled for Milestone 4).

## What went well
- Clean, decoupled authentication state using React Context.
- Fully accessible 44px+ touch targets and responsive layout down to 360px mobile viewports.
- Tested production build with zero warnings or errors.

## What to change
- In Milestone 3, expand the dashboard with the subject grid and color palette.
