import type { Spot } from '../domain/models';
import { mockVouchCounts } from './mock/stats';
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

/** In-memory SpotRepository backed by seed data. No network; always succeeds. */
export class MockSpotRepository implements SpotRepository {
  constructor(private readonly seed: SpotSeed) {}

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
}
