import type { Spot } from '../domain/models';
import type { SpotRepository } from './SpotRepository';

export interface SpotSeed {
  local: Spot[];
  mine: Spot[];
}

/** In-memory SpotRepository backed by seed data. No network; resolves immediately. */
export class MockSpotRepository implements SpotRepository {
  constructor(private readonly seed: SpotSeed) {}

  async listLocal(): Promise<Spot[]> {
    return this.seed.local;
  }

  async listMine(): Promise<Spot[]> {
    return this.seed.mine;
  }

  async getById(id: string): Promise<Spot | undefined> {
    return [...this.seed.local, ...this.seed.mine].find((s) => s.id === id);
  }
}
