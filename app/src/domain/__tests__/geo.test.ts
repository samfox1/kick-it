import { haversineMeters } from '../geo';

describe('haversineMeters', () => {
  it('is zero for the same point', () => {
    expect(haversineMeters({ lat: 43.07, lng: -89.4 }, { lat: 43.07, lng: -89.4 })).toBe(0);
  });

  it('measures ~111m for 0.001° of latitude', () => {
    const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 0.001, lng: 0 });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('is symmetric', () => {
    const a = { lat: 43.07, lng: -89.4 };
    const b = { lat: 43.08, lng: -89.41 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});
