import type { CategoryKey } from '@/domain/models';

/** Design tokens — the locked Kick It look (see ../mock for the HTML reference). */

export const colors = {
  ink: '#111111',
  blue: '#2563eb',
  paper: '#ffffff',
  muted: '#888888',
  muted2: '#aaaaaa',
  soft: '#f1f1ee',
  like: '#ef4444',
};

/** Semantic category colors for characteristic badges. */
export const categoryColors: Record<CategoryKey, { bg: string; fg: string }> = {
  outdoors: { bg: '#e4f7ea', fg: '#15803d' },
  vibe: { bg: '#f1e9ff', fg: '#6d28d9' },
  features: { bg: '#e8f0ff', fg: '#1d4ed8' },
  access: { bg: '#fff0e0', fg: '#c2620b' },
};

/** Avatar / multi-color accent ramp. */
export const accentRamp = ['#2563eb', '#16a34a', '#7c3aed', '#f59e0b', '#0d9488', '#ef4444'];

export const radii = { sm: 11, md: 14, lg: 18, xl: 20, pill: 999 };

export const space = (n: number) => n * 4;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/**
 * Hard offset "sticker" shadow (no blur). Looks crisp on iOS; Android falls back to elevation.
 */
export function hardShadow(offset = 4) {
  return {
    shadowColor: colors.ink,
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  } as const;
}

/** Standard ink border used on cards, bubbles, badges. */
export const inkBorder = { borderWidth: 2, borderColor: colors.ink } as const;

/** Applied while a tappable card is pressed — a subtle "give" so taps feel alive. */
export const pressedStyle = { transform: [{ scale: 0.985 }], opacity: 0.94 } as const;
