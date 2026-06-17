import type { Spot } from '../domain/models';
import { paginate, type Page, type PageParams } from './page';
import { ok, type Result } from './result';
import type { SpotRepository } from './SpotRepository';

export interface SpotSeed {
  local: Spot[];
  mine: Spot[];
}

/** In-memory SpotRepository backed by seed data. No network; always succeeds. */
export class MockSpotRepository implements SpotRepository {
  constructor(private readonly seed: SpotSeed) {}

  async listLocal(params?: PageParams): Promise<Result<Page<Spot>>> {
    return ok(paginate(this.seed.local, params));
  }

  async listMine(params?: PageParams): Promise<Result<Page<Spot>>> {
    return ok(paginate(this.seed.mine, params));
  }

  async getById(id: string): Promise<Result<Spot | undefined>> {
    return ok([...this.seed.local, ...this.seed.mine].find((s) => s.id === id));
  }
}
