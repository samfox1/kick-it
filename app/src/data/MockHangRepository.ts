import type { Hang } from '../domain/models';
import type { HangRepository } from './HangRepository';
import { paginate, type Page, type PageParams } from './page';
import { ok, type Result } from './result';

/** In-memory HangRepository backed by seed hangs. */
export class MockHangRepository implements HangRepository {
  constructor(private readonly hangs: Hang[]) {}

  async listForSpot(spotId: string, params?: PageParams): Promise<Result<Page<Hang>>> {
    return ok(
      paginate(
        this.hangs.filter((h) => h.spotId === spotId),
        params,
      ),
    );
  }
}
