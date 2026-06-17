import { hangToFeedItem, rankingToFeedItem } from '../feedItem';
import { makeHang, makeSpot } from '../../test-utils/factories';

describe('hangToFeedItem', () => {
  it('builds a hang feed item from the hang and its spot', () => {
    const hang = makeHang({ id: 'h7', spotId: 'x', note: 'great night', likes: 4 });
    const item = hangToFeedItem(hang, { name: 'Cool Spot', access: 'open' });
    expect(item.kind).toBe('hang');
    expect(item.id).toBe('feed-h7');
    expect(item.spotId).toBe('x');
    expect(item.spotName).toBe('Cool Spot');
    expect(item.access).toBe('open'); // taken from the spot, never guessed
    expect(item.note).toBe('great night');
    expect(item.likes).toBe(4);
  });
});

describe('rankingToFeedItem', () => {
  it('builds a ranked feed item from the actor, spot, and rank', () => {
    const by = { id: 'sam', name: 'Sam Fox', initial: 'S' };
    const spot = makeSpot({
      id: 'x',
      name: 'Cool Spot',
      category: 'park',
      access: 'open',
      score: 9.6,
    });
    const item = rankingToFeedItem(by, spot, 1);
    expect(item.kind).toBe('ranked');
    expect(item.spotId).toBe('x');
    expect(item.by.name).toBe('Sam Fox');
    expect(item.rank).toBe(1);
    expect(item.score).toBe(9.6);
  });
});
