import { Share } from 'react-native';

/** The user's personal invite link (mock — a real backend would mint this per user). */
export const INVITE_URL = 'https://kickit.app/i/samkicks';

/**
 * Open the OS share sheet with an invite to Kick It. Resolves quietly whether the
 * user shares or dismisses; a real build would also track the invite.
 */
export async function shareInvite(): Promise<void> {
  try {
    await Share.share({
      message: `Come kick it with me — the best spots to hang, ranked by people you trust. ${INVITE_URL}`,
    });
  } catch {
    // Share dismissed or unavailable; nothing to do in the mock.
  }
}
