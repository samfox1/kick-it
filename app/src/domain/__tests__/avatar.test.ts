import { AVATAR_BACKGROUNDS, buildAvatarUrl, defaultAvatarUrl } from '../avatar';

describe('buildAvatarUrl', () => {
  it('encodes the seed, background, and toggles', () => {
    const url = buildAvatarUrl({
      seed: 'sam fox',
      glasses: true,
      beard: false,
      background: 'ffd5dc',
    });
    expect(url).toContain('seed=sam%20fox');
    expect(url).toContain('backgroundColor=ffd5dc');
    expect(url).toContain('glassesProbability=100');
    expect(url).toContain('beardProbability=0');
    expect(url).toContain('notionists');
  });

  it('defaultAvatarUrl is deterministic for a given id', () => {
    expect(defaultAvatarUrl('user-1')).toBe(defaultAvatarUrl('user-1'));
    expect(defaultAvatarUrl('user-1')).toContain('seed=user-1');
    expect(defaultAvatarUrl('user-1')).toContain(`backgroundColor=${AVATAR_BACKGROUNDS[0]}`);
  });
});
