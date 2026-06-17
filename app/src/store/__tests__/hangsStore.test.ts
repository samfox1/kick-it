import { useHangsStore } from '../hangsStore';
import type { Hang } from '@/domain/models';

const hang = (id: string, over: Partial<Hang> = {}): Hang => ({
  id,
  spotId: 'pontoon',
  author: { id: 'sam', name: 'Sam', initial: 'S' },
  title: 'Title',
  note: 'note',
  image: 'x',
  when: 'now',
  attendees: [],
  extraAttendees: 0,
  likes: 0,
  ...over,
});

beforeEach(() => {
  useHangsStore.setState({ hangs: [hang('a'), hang('b', { spotId: 'rooftop' })], reactions: {} });
});

describe('hangsStore', () => {
  it('deletes a hang by id', () => {
    useHangsStore.getState().deleteHang('a');
    expect(useHangsStore.getState().hangs.map((h) => h.id)).toEqual(['b']);
  });

  it('updates a hang title and note', () => {
    useHangsStore.getState().updateHang('a', { title: 'New', note: 'changed' });
    const a = useHangsStore.getState().hangs.find((h) => h.id === 'a');
    expect(a?.title).toBe('New');
    expect(a?.note).toBe('changed');
  });

  it('leaves other hangs untouched on update', () => {
    useHangsStore.getState().updateHang('a', { title: 'New' });
    expect(useHangsStore.getState().hangs.find((h) => h.id === 'b')?.title).toBe('Title');
  });

  it('deleteHang on an unknown id leaves all hangs intact', () => {
    useHangsStore.getState().deleteHang('missing');
    expect(useHangsStore.getState().hangs.map((h) => h.id)).toEqual(['a', 'b']);
  });

  it('updateHang on an unknown id leaves all hangs intact', () => {
    useHangsStore.getState().updateHang('missing', { title: 'X' });
    expect(useHangsStore.getState().hangs.find((h) => h.id === 'a')?.title).toBe('Title');
  });

  it('updateHang with an empty patch keeps every field unchanged', () => {
    useHangsStore.getState().updateHang('a', {});
    const a = useHangsStore.getState().hangs.find((h) => h.id === 'a');
    expect(a).toEqual(expect.objectContaining({ id: 'a', title: 'Title', note: 'note' }));
  });
});

describe('hangsStore reactions', () => {
  it('toggleReaction flips a reaction on and off', () => {
    useHangsStore.getState().toggleReaction('a', 'fire');
    expect(useHangsStore.getState().reactions.a?.fire).toBe(true);
    useHangsStore.getState().toggleReaction('a', 'fire');
    expect(useHangsStore.getState().reactions.a?.fire).toBe(false);
  });

  it('tracks reactions per hang and per key independently', () => {
    useHangsStore.getState().toggleReaction('a', 'heart');
    useHangsStore.getState().toggleReaction('b', 'haha');
    expect(useHangsStore.getState().reactions.a).toEqual({ heart: true });
    expect(useHangsStore.getState().reactions.b).toEqual({ haha: true });
  });

  it('clears a hang’s reactions when it is deleted', () => {
    useHangsStore.getState().toggleReaction('a', 'heart');
    useHangsStore.getState().deleteHang('a');
    expect(useHangsStore.getState().reactions.a).toBeUndefined();
  });
});
