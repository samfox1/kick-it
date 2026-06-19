import type { FeedItem } from '../domain/models';
import type { FeedRepository } from './FeedRepository';
import { paginate, type Page, type PageParams } from './page';
import { ok, type Result } from './result';

/** In-memory FeedRepository backed by seed items. */
export class MockFeedRepository implements FeedRepository {
  constructor(private readonly items: FeedItem[]) {}

  async listFeed(params?: PageParams): Promise<Result<Page<FeedItem>>> {
    return ok(paginate(this.items, params));
  }

  // No-op: the mock feed lives in the store for the session (ephemeral).
  async postActivity(_item: FeedItem): Promise<Result<void>> {
    return ok(undefined);
  }
}
