import { paginate } from '../page';

const nums = [0, 1, 2, 3, 4];

describe('paginate', () => {
  it('returns everything with no nextCursor when no params are given', () => {
    const page = paginate(nums);
    expect(page.items).toEqual(nums);
    expect(page.nextCursor).toBeUndefined();
  });

  it('honors limit and exposes a cursor when more remain', () => {
    const page = paginate(nums, { limit: 2 });
    expect(page.items).toEqual([0, 1]);
    expect(page.nextCursor).toBe('2');
  });

  it('continues from a cursor', () => {
    const page = paginate(nums, { limit: 2, cursor: '2' });
    expect(page.items).toEqual([2, 3]);
    expect(page.nextCursor).toBe('4');
  });

  it('clears nextCursor on the final page', () => {
    const page = paginate(nums, { limit: 2, cursor: '4' });
    expect(page.items).toEqual([4]);
    expect(page.nextCursor).toBeUndefined();
  });

  it('walks the whole list page by page exactly once', () => {
    const seen: number[] = [];
    let cursor: string | undefined;
    do {
      const page = paginate(nums, { limit: 2, cursor });
      seen.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    expect(seen).toEqual(nums);
  });

  it('returns an empty page past the end', () => {
    const page = paginate(nums, { cursor: '99' });
    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeUndefined();
  });
});
