import type { NewSpot, Spot } from '../domain/models';
import { mockVouchCounts } from './mock/stats';
import { makeIdGenerator } from './mockId';
import { paginate, type Page, type PageParams } from './page';
import { ok, type Result } from './result';
import type { SpotRepository } from './SpotRepository';

export interface SpotSeed {
  local: Spot[];
  mine: Spot[];
}

/** Attach community stats the way a backend returns them in the spot payload. */
function withStats(spot: Spot): Spot {
  return { ...spot, vouchCounts: mockVouchCounts(spot.id, spot.characteristicIds) };
}

/** In-memory SpotRepository backed by seed data. Owns a copy of the seed so writes
 *  never mutate the caller's arrays. */
export class MockSpotRepository implements SpotRepository {
  private readonly seed: SpotSeed;
  private readonly nextId = makeIdGenerator('spot');
  private readonly savedIds = new Set<string>();

  constructor(seed: SpotSeed) {
    this.seed = { local: [...seed.local], mine: [...seed.mine] };
  }

  async listLocal(params?: PageParams): Promise<Result<Page<Spot>>> {
    return ok(paginate(this.seed.local.map(withStats), params));
  }

  async listMine(params?: PageParams): Promise<Result<Page<Spot>>> {
    return ok(paginate(this.seed.mine.map(withStats), params));
  }

  async getById(id: string): Promise<Result<Spot | undefined>> {
    const spot = [...this.seed.local, ...this.seed.mine].find((s) => s.id === id);
    return ok(spot ? withStats(spot) : undefined);
  }

  async createSpot(input: NewSpot): Promise<Result<Spot>> {
    // id is server-owned; score is derived from rank by the store (placeholder here).
    const spot: Spot = { ...input, id: this.nextId(), score: 0 };
    this.seed.mine.unshift(spot);
    return ok(spot);
  }

  async listSaved(params?: PageParams): Promise<Result<Page<Spot>>> {
    const all = [...this.seed.local, ...this.seed.mine];
    const items = [...this.savedIds]
      .map((id) => all.find((s) => s.id === id))
      .filter((s): s is Spot => Boolean(s))
      .map(withStats);
    return ok(paginate(items, params));
  }

  async saveSpot(spotId: string): Promise<Result<void>> {
    this.savedIds.add(spotId);
    return ok(undefined);
  }

  async unsaveSpot(spotId: string): Promise<Result<void>> {
    this.savedIds.delete(spotId);
    return ok(undefined);
  }

  // No-op: the mock is ephemeral, so ranking order lives in the store during a session
  // and resets to the seed on reload. Only the Supabase repo persists ranking.
  async setRanking(_spotIds: string[]): Promise<Result<void>> {
    return ok(undefined);
  }
}
