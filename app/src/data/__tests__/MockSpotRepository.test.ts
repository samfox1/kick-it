import { MockSpotRepository } from '../MockSpotRepository';
import { unwrap } from '../../test-utils/result';
import { makeSpot } from '../../test-utils/factories';

describe('MockSpotRepository', () => {
  const repo = new MockSpotRepository({
    local: [makeSpot({ id: 'l1' }), makeSpot({ id: 'l2' })],
    mine: [makeSpot({ id: 'm1' })],
  });

  it('lists local spots', async () => {
    expect(unwrap(await repo.listLocal()).items.map((s) => s.id)).toEqual(['l1', 'l2']);
  });

  it('lists my spots', async () => {
    expect(unwrap(await repo.listMine()).items.map((s) => s.id)).toEqual(['m1']);
  });

  it('gets a spot by id from either collection', async () => {
    expect(unwrap(await repo.getById('l2'))?.id).toBe('l2');
    expect(unwrap(await repo.getById('m1'))?.id).toBe('m1');
  });

  it('resolves undefined for an unknown id', async () => {
    expect(unwrap(await repo.getById('nope'))).toBeUndefined();
  });

  it('paginates with limit and a forward cursor', async () => {
    const first = unwrap(await repo.listLocal({ limit: 1 }));
    expect(first.items.map((s) => s.id)).toEqual(['l1']);
    expect(first.nextCursor).toBeDefined();

    const second = unwrap(await repo.listLocal({ limit: 1, cursor: first.nextCursor }));
    expect(second.items.map((s) => s.id)).toEqual(['l2']);
    expect(second.nextCursor).toBeUndefined();
  });
});
