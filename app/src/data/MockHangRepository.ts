import type { Hang } from '../domain/models';
import type { HangRepository } from './HangRepository';

/** In-memory HangRepository backed by seed hangs. */
export class MockHangRepository implements HangRepository {
  constructor(private readonly hangs: Hang[]) {}

  async listForSpot(spotId: string): Promise<Hang[]> {
    return this.hangs.filter((h) => h.spotId === spotId);
  }
}
