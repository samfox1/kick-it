import type { SupabaseClient } from '@supabase/supabase-js';

import type { Page, PageParams } from '@/data/page';
import { fail, ok, type Result } from '@/data/result';
import type { SpotRepository } from '@/data/SpotRepository';
import { applyRankScores } from '@/domain/ranking';
import type { NewSpot, Spot } from '@/domain/models';
import { failFrom } from './errors';
import { rowToSpot, type SpotRow } from './mappers';
import { currentUserId } from './session';
import { removeImages, uploadImage, uploadImages } from './storage';

const COLUMNS =
  'id, creator_id, name, category, access, location, lat, lng, image, images, characteristic_ids, description';

/**
 * Supabase-backed SpotRepository. The client is injected so this stays unit-testable
 * and free of the RN-only client module.
 *
 * Pagination is single-page for now (the Page contract allows it); keyset paging and
 * viewer-distance (`distanceMi`) are tracked in docs/BACKEND_INTEGRATION_TODO.md.
 */
export class SupabaseSpotRepository implements SpotRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listLocal(_params?: PageParams): Promise<Result<Page<Spot>>> {
    const { data, error } = await this.db.from('spots').select(COLUMNS).eq('access', 'open');
    if (error) return failFrom(error);
    return ok({ items: ((data ?? []) as SpotRow[]).map(rowToSpot) });
  }

  async listMine(_params?: PageParams): Promise<Result<Page<Spot>>> {
    // Ranked list: rankings joined to spots, ordered by position; score is derived
    // from position over the whole list (single page).
    const { data, error } = await this.db
      .from('rankings')
      .select(`position, spots ( ${COLUMNS} )`)
      .order('position', { ascending: true });
    if (error) return failFrom(error);
    const rows = (data ?? []) as unknown as { position: number; spots: SpotRow | null }[];
    const spots = rows.filter((r) => r.spots).map((r) => rowToSpot(r.spots as SpotRow));
    return ok({ items: applyRankScores(spots) });
  }

  async getById(id: string): Promise<Result<Spot | undefined>> {
    const { data, error } = await this.db.from('spots').select(COLUMNS).eq('id', id).maybeSingle();
    if (error) return failFrom(error);
    return ok(data ? rowToSpot(data as SpotRow) : undefined);
  }

  async createSpot(input: NewSpot): Promise<Result<Spot>> {
    const creatorId = await currentUserId(this.db);
    if (!creatorId) return fail('unauthorized', 'Not signed in');

    // Upload any local photos to Storage first, so we persist public URLs, not device paths.
    const cover = await uploadImage(this.db, creatorId, input.image);
    if (!cover.ok) return cover;
    const gallery = await uploadImages(this.db, creatorId, input.images ?? []);
    if (!gallery.ok) {
      await removeImages(this.db, [cover.value]); // don't orphan the cover
      return gallery;
    }

    const { data, error } = await this.db
      .from('spots')
      .insert({
        creator_id: creatorId,
        name: input.name,
        category: input.category,
        access: input.access,
        location: input.location,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        image: cover.value,
        images: gallery.value,
        characteristic_ids: input.characteristicIds,
        description: input.description ?? null,
      })
      .select(COLUMNS)
      .single();
    if (error) {
      await removeImages(this.db, [cover.value, ...gallery.value]); // clean up on insert failure
      return failFrom(error);
    }
    return ok(rowToSpot(data as SpotRow));
  }

  async listSaved(_params?: PageParams): Promise<Result<Page<Spot>>> {
    const { data, error } = await this.db.from('saved_spots').select(`spots ( ${COLUMNS} )`);
    if (error) return failFrom(error);
    const rows = (data ?? []) as unknown as { spots: SpotRow | null }[];
    const items = rows.filter((r) => r.spots).map((r) => rowToSpot(r.spots as SpotRow));
    return ok({ items });
  }

  async saveSpot(spotId: string): Promise<Result<void>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');
    const { error } = await this.db
      .from('saved_spots')
      .upsert({ user_id: userId, spot_id: spotId });
    return error ? failFrom(error) : ok(undefined);
  }

  async unsaveSpot(spotId: string): Promise<Result<void>> {
    const userId = await currentUserId(this.db);
    if (!userId) return fail('unauthorized', 'Not signed in');
    const { error } = await this.db
      .from('saved_spots')
      .delete()
      .eq('user_id', userId)
      .eq('spot_id', spotId);
    return error ? failFrom(error) : ok(undefined);
  }

  async setRanking(spotIds: string[]): Promise<Result<void>> {
    // One transaction rewrites the whole order (see the set_rankings RPC migration).
    const { error } = await this.db.rpc('set_rankings', { p_spot_ids: spotIds });
    return error ? failFrom(error) : ok(undefined);
  }

  async deleteSpot(spotId: string): Promise<Result<void>> {
    // Read the photos before deleting so we can clean them from Storage afterward.
    const { data: row } = await this.db
      .from('spots')
      .select('image, images')
      .eq('id', spotId)
      .maybeSingle();

    // Guarded server-side: creator-only, and only if no one else has engaged.
    const { error } = await this.db.rpc('delete_own_spot', { p_spot_id: spotId });
    if (error) {
      if (error.message?.includes('SPOT_HAS_ENGAGEMENT')) {
        return fail('unauthorized', "Can't delete — others have saved, ranked, or hung out here.");
      }
      return failFrom(error);
    }

    const r = row as { image?: string; images?: string[] } | null;
    if (r) await removeImages(this.db, [r.image ?? '', ...(r.images ?? [])]);
    return ok(undefined);
  }
}
