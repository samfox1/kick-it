import type { SupabaseClient } from '@supabase/supabase-js';

import { fail, ok, type Result } from '@/data/result';
import { failFrom } from './errors';

const BUCKET = 'media';

/** A local device file URI (from the image picker) that must be uploaded before persisting.
 *  Remote http(s) URLs (already-uploaded, or seed images) are left as-is. */
export function isLocalUri(uri: string): boolean {
  return /^(file|content|assets-library|ph):/i.test(uri);
}

function extFor(uri: string): string {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  return ext && /^[a-z0-9]{1,4}$/.test(ext) ? ext : 'jpg';
}

function contentTypeFor(uri: string): string {
  const ext = extFor(uri);
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}

/** Upload one local image to the user's folder, returning its public URL. Remote URLs and
 *  empty strings pass through unchanged, so callers can pass any image value safely. */
export async function uploadImage(
  db: SupabaseClient,
  userId: string,
  uri: string,
): Promise<Result<string>> {
  if (!uri || !isLocalUri(uri)) return ok(uri);

  let body: ArrayBuffer;
  try {
    body = await fetch(uri).then((r) => r.arrayBuffer());
  } catch {
    return fail('unknown', 'Could not read the selected image.');
  }

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extFor(uri)}`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, body, { contentType: contentTypeFor(uri), upsert: false });
  if (error) return failFrom(error);

  return ok(db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
}

const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

/** Extract the in-bucket path from one of our public media URLs, or null if it isn't ours
 *  (e.g. a seed picsum URL or empty). Used to clean up files when content is deleted. */
export function storagePathFromUrl(url: string): string | null {
  if (!url) return null;
  const i = url.indexOf(PUBLIC_PREFIX);
  return i === -1 ? null : url.slice(i + PUBLIC_PREFIX.length);
}

/** Best-effort delete of our uploaded images (ignores remote/seed URLs). Never throws. */
export async function removeImages(db: SupabaseClient, urls: string[]): Promise<void> {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  try {
    await db.storage.from(BUCKET).remove(paths);
  } catch {
    // Cleanup is best-effort; a failure must not block the delete it follows.
  }
}

/** Upload many images (remote URLs pass through), preserving order. Fails fast on first error. */
export async function uploadImages(
  db: SupabaseClient,
  userId: string,
  uris: string[],
): Promise<Result<string[]>> {
  const out: string[] = [];
  for (const uri of uris) {
    const res = await uploadImage(db, userId, uri);
    if (!res.ok) return res;
    out.push(res.value);
  }
  return ok(out);
}
