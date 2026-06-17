# Kick It

Beli, but for the places you kick it with your friends — a social app for rating, remembering,
and discovering casual hangout spots (a friend's basement, a bar patio, a park bench, your
uncle's pontoon). React Native via **Expo**. Mock data for now, structured to swap in a real
backend later.

> Visual design + clickable HTML reference lives one level up in `../mock/`. The locked look:
> white base, ink linework + offset shadows, **Inter**, score-by-color, semantic category colors
> (Outdoors / Vibe / Features / Access), and a hand-drawn doodle landing.

## Run it

```bash
cd app
npm install        # first time only
npm start          # then press i (iOS sim), a (Android), or scan the QR in Expo Go
```

- **On your phone:** install **Expo Go**, run `npm start`, scan the QR code.
- **iOS simulator:** `npm run ios`  •  **Android emulator:** `npm run android`  •  **Web:** `npm run web`

## Develop

```bash
npm test           # run the test suite (Jest + React Native Testing Library)
npm run test:watch # TDD watch mode
npm run typecheck  # strict TypeScript, no emit
npm run lint       # ESLint (expo)
npm run format     # Prettier write
```

We build **test-first** (see `docs/ARCHITECTURE.md`). A Husky pre-commit hook runs lint + typecheck;
pre-push runs the tests.

## Docs

- `CONTEXT.md` — domain glossary (the words we use and what they mean).
- `docs/ARCHITECTURE.md` — module map, layering, and how to add a feature.
- `SECURITY.md` — data handling, trust boundaries, what changes when the backend lands.
- `docs/adr/` — architecture decision records.
