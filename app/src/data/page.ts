/**
 * Forward-only pagination for list endpoints. Defined now (even though the mock
 * returns small seeds) so adding real paging later doesn't change any signature —
 * the promise of ADR-0002.
 */

/** Request a page. Omit entirely for "first page / everything available". */
export interface PageParams {
  /** Opaque continuation token from a previous page's `nextCursor`. */
  cursor?: string;
  /** Max items to return. Defaults to "all remaining" in the mock. */
  limit?: number;
}

/** One page of results. `nextCursor` is undefined when there are no more. */
export interface Page<T> {
  items: T[];
  nextCursor?: string;
}

/**
 * Slice an in-memory array into a Page using an opaque numeric-offset cursor.
 * Mock-only helper — a real backend paginates server-side and mints its own cursors.
 */
export function paginate<T>(all: T[], params?: PageParams): Page<T> {
  const start = params?.cursor ? Number(params.cursor) : 0;
  const limit = params?.limit ?? all.length;
  const items = all.slice(start, start + limit);
  const end = start + items.length;
  return { items, nextCursor: end < all.length ? String(end) : undefined };
}
