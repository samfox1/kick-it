/** Builds DiceBear "notionists" avatar URLs (CC0, illustrated) from simple options, so users
 *  get an on-brand avatar they can tweak. Pure + framework-free. */

const STYLE_URL = 'https://api.dicebear.com/9.x/notionists/png';

/** Brand pastel backgrounds the user can choose from (hex without '#'). */
export const AVATAR_BACKGROUNDS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
  'c1f4c5',
  'fff5ba',
];

export interface AvatarOptions {
  /** Drives all the randomized features (hair, eyes, nose…). Shuffle = new seed. */
  seed: string;
  glasses: boolean;
  beard: boolean;
  /** One of AVATAR_BACKGROUNDS. */
  background: string;
}

/** Build the avatar image URL for the given options. */
export function buildAvatarUrl(o: AvatarOptions): string {
  return (
    `${STYLE_URL}?seed=${encodeURIComponent(o.seed)}` +
    `&backgroundColor=${o.background}` +
    `&glassesProbability=${o.glasses ? 100 : 0}` +
    `&beardProbability=${o.beard ? 100 : 0}`
  );
}

/** A short random seed for shuffling the avatar's features. */
export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** A deterministic default avatar for a new user (stable from their id). */
export function defaultAvatarUrl(seed: string): string {
  return buildAvatarUrl({ seed, glasses: false, beard: false, background: AVATAR_BACKGROUNDS[0] });
}
