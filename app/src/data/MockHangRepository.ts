import type { Hang, NewHang } from '../domain/models';
import type { HangRepository } from './HangRepository';
import { makeIdGenerator } from './mockId';
import { paginate, type Page, type PageParams } from './page';
import { ok, type Result } from './result';

/** In-memory HangRepository backed by seed hangs. Owns a copy of the seed so writes
 *  never mutate the caller's array (matches a real backend's isolation). */
export class MockHangRepository implements HangRepository {
  private readonly hangs: Hang[];
  private readonly nextId = makeIdGenerator('hang');

  constructor(seed: Hang[]) {
    this.hangs = [...seed];
  }

  async listForSpot(spotId: string, params?: PageParams): Promise<Result<Page<Hang>>> {
    return ok(
      paginate(
        this.hangs.filter((h) => h.spotId === spotId),
        params,
      ),
    );
  }

  async logHang(input: NewHang): Promise<Result<Hang>> {
    // id, timestamp, and starting counts are server-owned — the repo mints them.
    const hang: Hang = {
      ...input,
      id: this.nextId(),
      when: 'Just now',
      likes: 0,
      extraAttendees: 0,
    };
    this.hangs.unshift(hang);
    return ok(hang);
  }
}
