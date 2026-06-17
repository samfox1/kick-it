const THRESHOLD = 6;

/**
 * Whether the floating nav should be hidden, given the current scroll offset `y`,
 * the change since the last event `dy`, and the `current` hidden state. At the top it's
 * always shown; scrolling down hides it, scrolling up reveals it; tiny jitters do nothing.
 */
export function tabBarHiddenOnScroll(y: number, dy: number, current: boolean): boolean {
  if (y <= 0) return false;
  if (dy > THRESHOLD) return true;
  if (dy < -THRESHOLD) return false;
  return current;
}
