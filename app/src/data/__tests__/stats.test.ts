import { mockSaveCount, mockVouchCounts } from '../mock/stats';

describe('mockVouchCounts', () => {
  it('returns a count per characteristic id', () => {
    const counts = mockVouchCounts('pontoon', ['aux', 'free']);
    expect(Object.keys(counts).sort()).toEqual(['aux', 'free']);
  });

  it('is deterministic and stays within the 3–18 range', () => {
    const a = mockVouchCounts('pontoon', ['aux', 'free', 'water']);
    const b = mockVouchCounts('pontoon', ['aux', 'free', 'water']);
    expect(a).toEqual(b);
    for (const n of Object.values(a)) {
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(18);
    }
  });

  it('returns an empty map for a spot with no characteristics', () => {
    expect(mockVouchCounts('pontoon', [])).toEqual({});
  });
});

describe('mockSaveCount', () => {
  it('is deterministic and within the 1–40 range', () => {
    expect(mockSaveCount('rooftop')).toBe(mockSaveCount('rooftop'));
    expect(mockSaveCount('rooftop')).toBeGreaterThanOrEqual(1);
    expect(mockSaveCount('rooftop')).toBeLessThanOrEqual(40);
  });
});
