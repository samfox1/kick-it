# 1. Record architecture decisions

Date: 2026-06-15

## Status
Accepted

## Context
We're building Kick It as a real app after an approved HTML mock. We want best practices baked
in from the start (deep modules, clear interfaces) and a record of *why* things are shaped the
way they are, so future changes — and tools like `/improve-codebase-architecture` — have context.

## Decision
Keep short ADRs in `docs/adr/`, numbered and append-only. Maintain a `CONTEXT.md` domain
glossary. Layer the code as domain (pure) → store → data-behind-interface, documented in
`docs/ARCHITECTURE.md`.

## Consequences
- Decisions are discoverable and durable.
- Slight overhead per significant decision (worth it).
