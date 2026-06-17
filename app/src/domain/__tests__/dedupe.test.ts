import { findDuplicateCandidates, nameSimilarity } from '../dedupe';
import { makeSpot } from '../../test-utils/factories';

describe('nameSimilarity', () => {
  it('is 1 for the same name ignoring case and punctuation', () => {
    expect(nameSimilarity("Joey's Basement", 'joey basement')).toBe(1);
  });

  it('is 0 for fully disjoint names', () => {
    expect(nameSimilarity('Rooftop Bar', 'Lake Pontoon')).toBe(0);
  });

  it('is partial when names share some words', () => {
    const s = nameSimilarity('The Tin Roof Patio', 'Tin Roof');
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});

describe('findDuplicateCandidates', () => {
  const base = { lat: 43.07, lng: -89.4 };

  it('returns spots within the radius, closest first', () => {
    const catalog = [
      makeSpot({ id: 'here', name: 'The Bench', lat: 43.0701, lng: -89.4 }), // ~11m
      makeSpot({ id: 'near', name: 'The Oak', lat: 43.0705, lng: -89.4 }), // ~55m
      makeSpot({ id: 'far', name: 'Across Town', lat: 43.09, lng: -89.4 }), // ~2km
    ];
    const out = findDuplicateCandidates(catalog, { name: 'The Bench', ...base }, 150);
    expect(out.map((m) => m.spot.id)).toEqual(['here', 'near']);
    expect(out[0].meters).toBeLessThan(out[1].meters);
  });

  it('ignores spots that have no coordinates', () => {
    const catalog = [makeSpot({ id: 'nocoord', name: 'The Bench' })];
    expect(findDuplicateCandidates(catalog, { name: 'The Bench', ...base }, 150)).toEqual([]);
  });

  it('reports name similarity alongside distance so a same-named neighbor stands out', () => {
    const catalog = [makeSpot({ id: 'dup', name: 'The Bench', lat: 43.0701, lng: -89.4 })];
    const [match] = findDuplicateCandidates(catalog, { name: 'the bench', ...base }, 150);
    expect(match.nameScore).toBe(1);
  });
});
