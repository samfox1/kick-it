# Maestro UI flows

End-to-end tap-through flows for Kick It. They drive the running app on a simulator,
emulator, or device and assert what's on screen.

## Setup

1. Install Maestro:
   ```
   curl -fsSL https://get.maestro.mobile.dev | bash
   ```
2. Run the app on a simulator/emulator (recommended over a phone for automation):
   - **Dev build (best for Maestro):** add `ios.bundleIdentifier` / `android.package` to
     `app.json`, then `npx expo run:ios` (or `run:android`). Maestro launches it by that id.
   - **Expo Go (works, finicky):** the app id is `host.exp.Exponent`; keep your project
     loaded and remove the `- launchApp` line (otherwise it relaunches Expo Go's home).
3. Set the app id and run:
   ```
   maestro test -e MAESTRO_APP_ID=com.you.kickit .maestro
   ```
   (replace with your dev-build id, or `host.exp.Exponent` for Expo Go)

Single flow: `maestro test -e MAESTRO_APP_ID=... .maestro/01-browse.yaml`
Screenshots: add `- takeScreenshot: name` steps, or use `maestro studio` to explore live.

## Flows

| File | Covers | Requires |
|------|--------|----------|
| `01-browse.yaml` | Guest browses: Explore → open a spot → see the Hang Ledger → back | any mode |
| `02-write-gate.yaml` | Guest taps "Rank this spot" → "Create an account" prompt appears (write-gating) | Supabase mode + signed out |
| `03-signin-modal.yaml` | Settings → sign-in modal opens, email step renders + typeable | Supabase mode + signed out |

## Not covered (manual)
- **OTP completion** — `03` stops before "Send code" so it doesn't fire real emails. Entering
  the code + verifying needs a real inbox; test it by hand.
- **Signed-in writes** (log a hang, rank, react) — need a real signed-in account (post-OTP),
  so they're a manual pass once you've signed in.
