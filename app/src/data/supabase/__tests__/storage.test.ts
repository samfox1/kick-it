import { isLocalUri, storagePathFromUrl } from '../storage';

describe('isLocalUri', () => {
  it('flags device file URIs that need uploading', () => {
    expect(isLocalUri('file:///var/mobile/.../photo.jpg')).toBe(true);
    expect(isLocalUri('content://media/external/images/1')).toBe(true);
    expect(isLocalUri('ph://ABC-123')).toBe(true);
  });

  it('passes through remote URLs and empties', () => {
    expect(isLocalUri('https://x.supabase.co/storage/v1/object/public/media/a.jpg')).toBe(false);
    expect(isLocalUri('https://picsum.photos/seed/x/300/200')).toBe(false);
    expect(isLocalUri('')).toBe(false);
  });
});

describe('storagePathFromUrl', () => {
  it('extracts the in-bucket path from one of our media URLs', () => {
    const url = 'https://x.supabase.co/storage/v1/object/public/media/uid-1/123-abc.jpg';
    expect(storagePathFromUrl(url)).toBe('uid-1/123-abc.jpg');
  });

  it('returns null for non-media URLs (seed/remote) and empties', () => {
    expect(storagePathFromUrl('https://picsum.photos/seed/x/300/200')).toBeNull();
    expect(storagePathFromUrl('')).toBeNull();
  });
});
