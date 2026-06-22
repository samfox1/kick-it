import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_WIDTH = 1280;

/**
 * Shrink a picked photo before upload: cap the width at 1280px and re-encode as JPEG ~0.7.
 * Cuts multi-MB camera shots to a few hundred KB. Falls back to the original uri on any error,
 * so a manipulation failure never blocks creating a spot/hang.
 */
export async function compressImage(uri: string, originalWidth?: number): Promise<string> {
  try {
    const context = ImageManipulator.manipulate(uri);
    if (!originalWidth || originalWidth > MAX_WIDTH) context.resize({ width: MAX_WIDTH });
    const image = await context.renderAsync();
    const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
    return result.uri;
  } catch {
    return uri;
  }
}
