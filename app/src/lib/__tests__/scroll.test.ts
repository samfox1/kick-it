import { tabBarHiddenOnScroll } from '../scroll';

describe('tabBarHiddenOnScroll', () => {
  it('always shows the bar at the very top', () => {
    expect(tabBarHiddenOnScroll(0, 50, true)).toBe(false);
    expect(tabBarHiddenOnScroll(-10, 50, true)).toBe(false);
  });

  it('hides when scrolling down past the threshold', () => {
    expect(tabBarHiddenOnScroll(200, 10, false)).toBe(true);
  });

  it('shows when scrolling up past the threshold', () => {
    expect(tabBarHiddenOnScroll(200, -10, true)).toBe(false);
  });

  it('keeps the current state for tiny jitters', () => {
    expect(tabBarHiddenOnScroll(200, 2, true)).toBe(true);
    expect(tabBarHiddenOnScroll(200, -2, false)).toBe(false);
  });
});
