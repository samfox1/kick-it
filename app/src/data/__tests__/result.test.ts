import { fail, ok } from '../result';

describe('Result helpers', () => {
  it('ok wraps a value', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('fail carries a code and message', () => {
    const r = fail('not_found', 'no such spot');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe('not_found');
      expect(r.error.message).toBe('no such spot');
    }
  });
});
