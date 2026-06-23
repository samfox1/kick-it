// Repo whose logHang fails, to exercise the store's error path.
import { useHangsStore } from '../hangsStore';

jest.mock('@/data/mock/hangSeed', () => {
  const actual = jest.requireActual('@/data/mock/hangSeed');
  return {
    ...actual,
    createDefaultHangRepository: () => ({
      listForSpot: async () => ({ ok: true, value: { items: [] } }),
      logHang: async () => ({ ok: false, error: { code: 'network', message: 'offline' } }),
    }),
  };
});

describe('hangsStore.logHang error handling', () => {
  it('returns the error and leaves the ledger unchanged on failure', async () => {
    useHangsStore.setState({ hangs: [], reactions: {} });
    const res = await useHangsStore.getState().logHang({
      spotId: 'x',
      author: { id: 'sam', name: 'Sam Fox', initial: 'S' },
      title: 'should not persist',
      note: 'n',
      image: 'i',
      attendees: [],
    });
    expect(res.ok).toBe(false);
    expect(useHangsStore.getState().hangs).toHaveLength(0);
  });
});
