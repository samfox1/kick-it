import { MockSpotRepository } from '../MockSpotRepository';
import { makeSpot } from '../../test-utils/factories';

describe('MockSpotRepository', () => {
  const repo = new MockSpotRepository({
    local: [makeSpot({ id: 'l1' }), makeSpot({ id: 'l2' })],
    mine: [makeSpot({ id: 'm1' })],
  });

  it('lists local spots', async () => {
    expect((await repo.listLocal()).map((s) => s.id)).toEqual(['l1', 'l2']);
  });

  it('lists my spots', async () => {
    expect((await repo.listMine()).map((s) => s.id)).toEqual(['m1']);
  });

  it('gets a spot by id from either collection', async () => {
    expect((await repo.getById('l2'))?.id).toBe('l2');
    expect((await repo.getById('m1'))?.id).toBe('m1');
  });

  it('resolves undefined for an unknown id', async () => {
    expect(await repo.getById('nope')).toBeUndefined();
  });
});
