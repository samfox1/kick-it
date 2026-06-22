import { withDistances } from '../distance';
import { makeSpot } from '../../test-utils/factories';

const origin = { lat: 43.0731, lng: -89.4012 }; // downtown Madison

describe('withDistances', () => {
  it('sets distanceMi from the origin for spots with coordinates', () => {
    const here = makeSpot({ id: 'a', lat: 43.0731, lng: -89.4012 });
    const farther = makeSpot({ id: 'b', lat: 43.1097, lng: -89.4206 }); // ~2.7mi north
    const [a, b] = withDistances([here, farther], origin);
    expect(a.distanceMi).toBe(0);
    expect(b.distanceMi).toBeGreaterThan(2);
    expect(b.distanceMi).toBeLessThan(4);
  });

  it('leaves spots without coordinates unchanged', () => {
    const noCoords = makeSpot({ id: 'c', lat: undefined, lng: undefined, distanceMi: 5 });
    expect(withDistances([noCoords], origin)[0].distanceMi).toBe(5);
  });
});
