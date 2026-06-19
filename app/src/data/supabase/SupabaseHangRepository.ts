import type { SupabaseClient } from '@supabase/supabase-js';

import type { HangRepository, ReactionMap } from '@/data/HangRepository';
import type { Page, PageParams } from '@/data/page';
import { fail, ok, type Result } from '@/data/result';
import type { Hang, NewHang, ReactionKey } from '@/domain/models';
import { failFrom } from './errors';
import { rowToHang, type HangRow } from './mappers';
import { currentUserId } from './session';

const COLUMNS =
  'id, spot_id, title, note, image, extra_attendees, attendees, created_at, author:profiles!author_id ( id, name, initial )';

/**
 * Supabase-backed HangRepository. Attendees are a denormalized snapshot on the row;
 * `likes` is 0 until reactions are persisted (see docs/BACKEND_INTEGRATION_TODO.md).
 */
export class SupabaseHangRepository implements HangRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listForSpot(spotId: string, _params?: PageParams): Promise<Result<Page<Hang>>> {
    const { data, error } = await this.db
      .from('hangs')
      .select(COLUMNS)
      .eq('spot_id', spotId)
      .order('created_at', { ascending: false });
    if (error) return failFrom(error);
    return ok({ items: ((data ?? []) as unknown as HangRow[]).map((r) => rowToHang(r)) });
  }

  async listMine(_params?: PageParams): Promise<Result<Page<Hang>>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');
    const { data, error } = await this.db
      .from('hangs')
      .select(COLUMNS)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    if (error) return failFrom(error);
    return ok({ items: ((data ?? []) as unknown as HangRow[]).map((r) => rowToHang(r)) });
  }

  async logHang(input: NewHang): Promise<Result<Hang>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');

    const { data, error } = await this.db
      .from('hangs')
      .insert({
        spot_id: input.spotId,
        author_id: userId,
        title: input.title,
        note: input.note,
        image: input.image,
        attendees: input.attendees,
        extra_attendees: 0,
      })
      .select(COLUMNS)
      .single();
    if (error) return failFrom(error);
    return ok(rowToHang(data as unknown as HangRow));
  }

  async deleteHang(id: string): Promise<Result<void>> {
    const { error } = await this.db.from('hangs').delete().eq('id', id);
    return error ? failFrom(error) : ok(undefined);
  }

  async updateHang(id: string, patch: { title?: string; note?: string }): Promise<Result<void>> {
    const { error } = await this.db.from('hangs').update(patch).eq('id', id);
    return error ? failFrom(error) : ok(undefined);
  }

  async listMyReactions(): Promise<Result<ReactionMap>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');
    const { data, error } = await this.db
      .from('reactions')
      .select('hang_id, key')
      .eq('user_id', userId);
    if (error) return failFrom(error);
    const map: ReactionMap = {};
    for (const r of (data ?? []) as { hang_id: string; key: ReactionKey }[]) {
      (map[r.hang_id] ??= {})[r.key] = true;
    }
    return ok(map);
  }

  async setReaction(hangId: string, key: ReactionKey, on: boolean): Promise<Result<void>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');
    if (on) {
      const { error } = await this.db
        .from('reactions')
        .upsert({ user_id: userId, hang_id: hangId, key });
      return error ? failFrom(error) : ok(undefined);
    }
    const { error } = await this.db
      .from('reactions')
      .delete()
      .eq('user_id', userId)
      .eq('hang_id', hangId)
      .eq('key', key);
    return error ? failFrom(error) : ok(undefined);
  }
}
