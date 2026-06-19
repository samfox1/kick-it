import { MockSpotRepository } from '../MockSpotRepository';
import { unwrap } from '../../test-utils/result';
import { makeSpot } from '../../test-utils/factories';

describe('MockSpotRepository', () => {
  const repo = new MockSpotRepository({
    local: [makeSpot({ id: 'l1' }), makeSpot({ id: 'l2' })],
    mine: [makeSpot({ id: 'm1' })],
  });

  it('attaches a vouch count for each of a spot’s characteristics', async () => {
    const withChars = new MockSpotRepository({
      local: [makeSpot({ id: 'c1', characteristicIds: ['aux', 'free'] })],
      mine: [],
    });
    const spot = unwrap(await withChars.listLocal()).items[0];
    expect(Object.keys(spot.vouchCounts ?? {}).sort()).toEqual(['aux', 'free']);
    expect(unwrap(await withChars.getById('c1'))?.vouchCounts).toBeDefined();
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

  const spotDraft = {
    name: 'My Backyard',
    category: 'backyard',
    access: 'friends' as const,
    distanceMi: 0,
    location: '',
    image: 'x.jpg',
    characteristicIds: [],
  };

  it('createSpot stores a new spot in mine and fills id + placeholder score', async () => {
    const repo2 = new MockSpotRepository({ local: [], mine: [] });
    const created = unwrap(await repo2.createSpot(spotDraft));
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('My Backyard');
    expect(created.score).toBe(0); // re-derived from rank by the store
    expect(unwrap(await repo2.listMine()).items.map((s) => s.id)).toContain(created.id);
  });

  it('createSpot does not mutate the seed passed to the constructor', async () => {
    const seed = { local: [], mine: [] };
    const repo2 = new MockSpotRepository(seed);
    await repo2.createSpot(spotDraft);
    expect(seed.mine).toHaveLength(0); // repo owns a copy
  });

  it('setRanking is a safe no-op for the mock (persistence is the Supabase repo’s job)', async () => {
    const repo2 = new MockSpotRepository({
      local: [],
      mine: [makeSpot({ id: 'a' }), makeSpot({ id: 'b' })],
    });
    const res = await repo2.setRanking(['b', 'a']);
    expect(res.ok).toBe(true);
    // listMine still reflects the seed — the mock doesn't persist ranking order.
    expect(unwrap(await repo2.listMine()).items.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('saveSpot/listSaved/unsaveSpot track bookmarks by id', async () => {
    const repo2 = new MockSpotRepository({
      local: [makeSpot({ id: 'l1' }), makeSpot({ id: 'l2' })],
      mine: [],
    });
    expect(unwrap(await repo2.listSaved()).items).toEqual([]);

    await repo2.saveSpot('l1');
    await repo2.saveSpot('l1'); // idempotent
    expect(unwrap(await repo2.listSaved()).items.map((s) => s.id)).toEqual(['l1']);

    await repo2.unsaveSpot('l1');
    expect(unwrap(await repo2.listSaved()).items).toEqual([]);
  });
});
