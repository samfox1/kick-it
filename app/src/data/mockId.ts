/**
 * Monotonic id generator for the mock repositories. A real backend assigns ids;
 * this just keeps them unique and prefixed within a session.
 */
export function makeIdGenerator(prefix: string): () => string {
  let seq = 0;
  return () => `${prefix}-${(seq += 1)}`;
}
