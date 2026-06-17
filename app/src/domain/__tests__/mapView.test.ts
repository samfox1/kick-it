import { mapPositions } from '../mapView';

describe('mapPositions', () => {
  it('returns nothing for no points', () => {
    expect(mapPositions([])).toEqual([]);
  });

  it('centers a single point', () => {
    expect(mapPositions([{ id: 'a', lat: 43, lng: -89 }])).toEqual([{ id: 'a', nx: 0.5, ny: 0.5 }]);
  });

  it('places northern points higher (smaller ny) and keeps everything in the padded box', () => {
    const out = mapPositions(
      [
        { id: 'north', lat: 43.1, lng: -89.4 },
        { id: 'south', lat: 43.0, lng: -89.3 },
      ],
      0.1,
    );
    const north = out.find((p) => p.id === 'north')!;
    const south = out.find((p) => p.id === 'south')!;
    expect(north.ny).toBeLessThan(south.ny);
    out.forEach((p) => {
      expect(p.nx).toBeGreaterThanOrEqual(0.1);
      expect(p.nx).toBeLessThanOrEqual(0.9);
      expect(p.ny).toBeGreaterThanOrEqual(0.1);
      expect(p.ny).toBeLessThanOrEqual(0.9);
    });
  });
});
