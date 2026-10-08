# a life in bloom.

A dreamy, local-first personal life planning website built with React, TypeScript, Vite, Tailwind CSS, Dexie, Framer Motion, FullCalendar, and Recharts.

## Features in this Phase 1 MVP

- Personalized dashboard with goals, tasks, budget snapshot, and mood overview
- Persistent local data storage using IndexedDB via Dexie
- Goal planning cards for short- and long-term thinking
- Daily/weekly task management with task filters and completion tracking
- Monthly calendar with add-event functionality and drag-and-drop support
- Journal entries with date-based capture and tags
- Mood tracking with a simple history chart
- Budget tracking with income and expense entries
- Countdown cards for meaningful future moments
- Personalization settings with accent color changes and data export/import

## Project structure

- src/components — shared layout and reusable UI pieces
- src/context — planner state and persistence context
- src/lib — Dexie database, defaults, and shared logic
- src/pages — the main planner pages
- src/types.ts — typed data models

## Local run

1. Install dependencies:
   npm install
2. Start the app:
   npm run dev -- --host 0.0.0.0
3. Open the local Vite URL shown in the terminal, usually http://localhost:5173/

## Production build

npm run build

## Vercel deployment

Vercel should detect this as a Vite project. Use `npm run build` as the build command and `dist` as the output directory. `vercel.json` rewrites direct route requests to the React application so pages also work after refresh.

There are currently no required environment variables. Do not commit local `.env` files or planner exports.

## Deployment privacy

The application has no authentication or server-side database. Anyone who can reach a deployment can open the planner UI. IndexedDB records stay in that visitor's browser and are not uploaded to Vercel, but they also do not sync across browsers, devices, or deployment origins. Use Vercel Deployment Protection or another access-control layer if the site itself should not be publicly reachable, and do not treat deployment as a private account or cloud backup. Export data before moving to a new origin and import it there manually.

## Checks

- `npm test` runs unit and IndexedDB persistence tests.
- `npm run lint` runs Oxlint.
- `npm run build` runs the TypeScript check and production build.

Budget values are stored as integer cents. The database upgrade converts exact, unchanged starter transactions and preserves their original values. Historical values that cannot be safely interpreted are excluded from totals and require an explicit cents-or-dollars choice in the Budget page.

Calendar and date-only planner fields use local calendar values; backups are validated before all planner tables are restored in a single IndexedDB transaction.

## Notes

- This is intentionally a local-first MVP; data is stored inside the browser with IndexedDB and does not sync across devices.
- Some advanced planning features from the original vision are intentionally planned for later phases rather than pretending to be complete.

## Roadmap

- Drag-and-drop dashboard widget layout editor
- Freeform vision board with image upload, layered items, and transforms
- Richer calendar editing and recurring events
- Advanced goal lists, Kanban board, and milestone progression
- Journal autosave and richer writing tools
- More expressive decorative motion and scrapbook-style UI refinement

## Privacy & persistence

This app stores content in the browser only. It is designed for personal use without authentication or cloud storage.
