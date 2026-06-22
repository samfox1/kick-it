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
