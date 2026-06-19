import type { Hang, NewHang, ReactionKey } from '../domain/models';
import { CURRENT_MEMBER } from './mock/profile';
import type { HangRepository, ReactionMap } from './HangRepository';
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

  async listMine(params?: PageParams): Promise<Result<Page<Hang>>> {
    return ok(
      paginate(
        this.hangs.filter((h) => h.author.id === CURRENT_MEMBER.id),
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

  async deleteHang(id: string): Promise<Result<void>> {
    const i = this.hangs.findIndex((h) => h.id === id);
    if (i !== -1) this.hangs.splice(i, 1);
    return ok(undefined);
  }

  async updateHang(id: string, patch: { title?: string; note?: string }): Promise<Result<void>> {
    const hang = this.hangs.find((h) => h.id === id);
    if (hang) Object.assign(hang, patch);
    return ok(undefined);
  }

  // Reactions live in the store for the ephemeral mock; these are no-ops.
  async listMyReactions(): Promise<Result<ReactionMap>> {
    return ok({});
  }

  async setReaction(_hangId: string, _key: ReactionKey, _on: boolean): Promise<Result<void>> {
    return ok(undefined);
  }
}
