import { CHARACTERISTICS, getCharacteristic } from '../characteristics';

describe('getCharacteristic', () => {
  it('returns the label and category for a known id', () => {
    expect(getCharacteristic('aux')).toEqual({
      id: 'aux',
      label: 'Aux access',
      category: 'features',
    });
  });

  it('returns undefined for an unknown id', () => {
    expect(getCharacteristic('nope')).toBeUndefined();
  });
});

describe('CHARACTERISTICS catalog integrity', () => {
  it('has unique ids', () => {
    const ids = CHARACTERISTICS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only uses the four valid categories', () => {
    const valid = new Set(['outdoors', 'vibe', 'features', 'access']);
    expect(CHARACTERISTICS.every((c) => valid.has(c.category))).toBe(true);
  });
});
