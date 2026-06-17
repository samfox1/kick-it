import { clampScore, scoreColor } from '../score';

describe('clampScore', () => {
  it('passes through in-range scores', () => {
    expect(clampScore(0)).toBe(0);
    expect(clampScore(7.3)).toBe(7.3);
    expect(clampScore(10)).toBe(10);
  });

  it('clamps below 0 and above 10', () => {
    expect(clampScore(-3)).toBe(0);
    expect(clampScore(13)).toBe(10);
  });
});

describe('scoreColor', () => {
  it('maps 0 to pure red (hue 0)', () => {
    expect(scoreColor(0)).toBe('hsl(0 70% 44%)');
  });

  it('maps 5 to yellow (hue 60)', () => {
    expect(scoreColor(5)).toBe('hsl(60 70% 44%)');
  });

  it('maps 10 to green (hue 120)', () => {
    expect(scoreColor(10)).toBe('hsl(120 70% 44%)');
  });

  it('maps an intermediate score by hue = score * 12', () => {
    expect(scoreColor(8.9)).toBe('hsl(106.8 70% 44%)');
  });

  it('clamps scores below 0 to red', () => {
    expect(scoreColor(-3)).toBe('hsl(0 70% 44%)');
  });

  it('clamps scores above 10 to green', () => {
    expect(scoreColor(13)).toBe('hsl(120 70% 44%)');
  });
});
