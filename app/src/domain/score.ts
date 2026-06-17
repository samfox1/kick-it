/**
 * Maps a 0–10 spot score to a color, low = red, mid = yellow, high = green.
 * Hue runs 0° (red) → 120° (green) as score goes 0 → 10. Score is clamped.
 */
export function scoreColor(score: number): string {
  const clamped = Math.max(0, Math.min(10, score));
  const hue = Math.round(clamped * 12 * 10) / 10; // 1-decimal precision, avoids float noise
  return `hsl(${hue} 70% 44%)`;
}
