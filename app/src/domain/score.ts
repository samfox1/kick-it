/** Clamp a value into the valid 0–10 spot-score range. */
export function clampScore(score: number): number {
  return Math.max(0, Math.min(10, score));
}

/**
 * Maps a 0–10 spot score to a color, low = red, mid = yellow, high = green.
 * Hue runs 0° (red) → 120° (green) as score goes 0 → 10. Score is clamped.
 */
export function scoreColor(score: number): string {
  const hue = Math.round(clampScore(score) * 12 * 10) / 10; // 1-decimal precision, avoids float noise
  return `hsl(${hue} 70% 44%)`;
}
