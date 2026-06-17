import type { FeedItem } from '../domain/models';
import type { Page, PageParams } from './page';
import type { Result } from './result';

/** Narrow contract for the activity feed. Swap the mock for a backend later — screens unchanged. */
export interface FeedRepository {
  listFeed(params?: PageParams): Promise<Result<Page<FeedItem>>>;
}
