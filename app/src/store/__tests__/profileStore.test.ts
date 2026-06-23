import { isMe, useProfileStore } from '../profileStore';

beforeEach(() =>
  useProfileStore.setState({
    member: { id: 'sam', name: 'Sam Fox', initial: 'S' },
    handle: '@samkicks',
  }),
);

describe('profileStore.updateProfile', () => {
  it('updates the name and re-derives the avatar initial', () => {
    useProfileStore.getState().updateProfile({ name: 'Alex Doe' });
    expect(useProfileStore.getState().member.name).toBe('Alex Doe');
    expect(useProfileStore.getState().member.initial).toBe('A');
  });

  it('updates the handle', () => {
    useProfileStore.getState().updateProfile({ handle: '@newhandle' });
    expect(useProfileStore.getState().handle).toBe('@newhandle');
  });

  it('leaves other fields untouched on a partial update', () => {
    useProfileStore.getState().updateProfile({ name: 'Alex' });
    expect(useProfileStore.getState().handle).toBe('@samkicks');
    expect(useProfileStore.getState().member.id).toBe('sam');
  });

  it('trims the stored name', () => {
    useProfileStore.getState().updateProfile({ name: '  Alex  ' });
    expect(useProfileStore.getState().member.name).toBe('Alex');
    expect(useProfileStore.getState().member.initial).toBe('A');
  });

  it('ignores an empty or whitespace-only name', () => {
    useProfileStore.getState().updateProfile({ name: '   ' });
    expect(useProfileStore.getState().member.name).toBe('Sam Fox');
    expect(useProfileStore.getState().member.initial).toBe('S');
  });
});

describe('profileStore.hydrate', () => {
  it('replaces the member identity (e.g. with the authenticated user)', () => {
    useProfileStore.getState().hydrate({ id: 'uuid-123', name: 'Sam Fox', initial: 'S' });
    expect(useProfileStore.getState().member).toEqual({
      id: 'uuid-123',
      name: 'Sam Fox',
      initial: 'S',
    });
    expect(isMe('uuid-123')).toBe(true);
    expect(isMe('sam')).toBe(false);
  });
});

describe('profileStore.claimUsername', () => {
  it('sets the name + handle from the chosen username (mock mode)', async () => {
    const res = await useProfileStore.getState().claimUsername('nightowl');
    expect(res.ok).toBe(true);
    expect(useProfileStore.getState().member.name).toBe('nightowl');
    expect(useProfileStore.getState().member.initial).toBe('N');
    expect(useProfileStore.getState().handle).toBe('@nightowl');
  });
});

describe('isMe', () => {
  it('matches the current user id, nothing else', () => {
    expect(isMe('sam')).toBe(true);
    expect(isMe('marcus')).toBe(false);
  });
});
