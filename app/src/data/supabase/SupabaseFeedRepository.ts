import type { SupabaseClient } from '@supabase/supabase-js';

import type { FeedRepository } from '@/data/FeedRepository';
import type { Page, PageParams } from '@/data/page';
import { fail, ok, type Result } from '@/data/result';
import type { FeedItem } from '@/domain/models';
import { failFrom } from './errors';
import { timeAgo } from './mappers';

/**
 * Supabase-backed FeedRepository. The feed is an immutable activity log: each row stores a
 * denormalized FeedItem snapshot (payload), so cards render without joins. `when` is recomputed
 * from created_at on read so relative times stay fresh. RLS limits rows to visible spots.
 */
export class SupabaseFeedRepository implements FeedRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listFeed(_params?: PageParams): Promise<Result<Page<FeedItem>>> {
    const { data, error } = await this.db
      .from('activity')
      .select('created_at, payload')
      .order('created_at', { ascending: false });
    if (error) return failFrom(error);
    const items = ((data ?? []) as { created_at: string; payload: FeedItem }[]).map((r) => ({
      ...r.payload,
      when: timeAgo(r.created_at),
    }));
    return ok({ items });
  }

  async postActivity(item: FeedItem): Promise<Result<void>> {
    // New spots are discovered on Explore, not the feed.
    if (item.kind === 'new_spot') return ok(undefined);

    const { data: userData } = await this.db.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return fail('unauthorized', 'Not signed in');

    // The hang feed id is `feed-<hangId>`; recover it so deleting the hang cascades the row.
    const hangId = item.kind === 'hang' && item.id.startsWith('feed-') ? item.id.slice(5) : null;

    const { error } = await this.db.from('activity').insert({
      kind: item.kind,
      actor_id: userId,
      spot_id: item.spotId,
      hang_id: hangId,
      rank: item.kind === 'ranked' ? item.rank : null,
      payload: item,
    });
    return error ? failFrom(error) : ok(undefined);
  }
}
