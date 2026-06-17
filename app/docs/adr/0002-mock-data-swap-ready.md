# 2. Mock data behind a swap-ready repository

Date: 2026-06-15

## Status
Accepted

## Context
The first build uses mock data and a single user (no auth), but we want a real backend
(e.g. Supabase) to drop in later without rewriting screens. We also want the domain logic
(scoring, ranking, filtering) testable without any I/O.

## Decision
- All spot reads go through a narrow async **`SpotRepository`** interface
  (`listLocal` / `listMine` / `getById`).
- The only implementation today is **`MockSpotRepository`**, constructed over injected seed data
  (`src/data/mock/seed.ts`). Tests inject their own seed for isolation.
- **Domain logic is pure** and React/IO-free, so it's unit-tested directly.
- A real backend later = a new class implementing `SpotRepository`; the store and screens are
  unchanged.

## Consequences
- Clean seam for the backend; trivial, fast domain tests.
- Async signatures even though the mock is synchronous (intentional — matches the future network
  shape so call sites don't change).
- Auth/authorization (enforcing `access` levels) is explicitly **out of scope** now and tracked in
  `SECURITY.md` for when the backend lands.
