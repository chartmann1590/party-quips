# Repository Guidelines

## Project Structure & Module Organization

This is a React + TypeScript + Vite party game app with Firebase Realtime Database and Capacitor Android support. Main code lives in `src/`: routes in `src/pages`, reusable UI in `src/components`, Firebase adapters in `src/firebase`, shared logic in `src/lib`, hooks in `src/hooks`, Zustand state in `src/store`, and domain types in `src/types`. Global styling is in `src/styles/globals.css`; Tailwind config is in `tailwind.config.ts`.

Static assets belong in `public/`. Generated output goes to `dist/` and should not be edited directly. Android files live under `android/`. Firebase deployment and rules use `firebase.json`, `.firebaserc`, and `database.rules.json`.

## Build, Test, and Development Commands

- `npm install`: install JavaScript dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run build`: generate icons, type-check, build with Vite, and create `dist/404.html` for GitHub Pages SPA routing.
- `npm run preview`: serve the built app locally.
- `npm run lint`: run TypeScript checks with `tsc --noEmit`.
- `cd android && ./gradlew test`: run Android unit tests when Android code changes.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing style: two-space indentation, single quotes, no semicolons, and concise named exports. Components and pages use `PascalCase` filenames such as `HostLobbyPage.tsx`; hooks use `useX.ts`; utilities use `camelCase.ts`. Prefer the `@/*` alias for cross-directory imports.

Keep UI logic in components/pages, Firebase reads and writes in `src/firebase` or hooks, and pure game rules in `src/lib`.

## Testing Guidelines

There is no dedicated web test runner configured yet, so `npm run lint` and `npm run build` are the baseline checks. For game logic, add focused tests near the module under test or in a future `src/__tests__` tree. For Android changes, use `android/app/src/test` and `android/app/src/androidTest`.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects, for example `Fix stale room code reuse and slow lobby setup` or `Add Auto-Quip: AI-generated answers for idle or stuck players`. Keep commits focused and behavior-oriented.

Pull requests should include a summary, test/build results, linked issues when relevant, and screenshots or recordings for UI changes on host and phone views. Note Firebase rule or environment changes explicitly.

## Security & Configuration Tips

Do not commit `.env.local` or secrets. Copy `.env.example` when setting up Firebase locally. Review `database.rules.json` with any room, player, or game-state schema change, and keep PWA runtime caching from storing Firebase game traffic.
