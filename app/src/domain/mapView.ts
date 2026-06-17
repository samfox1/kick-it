export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
}

/**
 * Projects geo points into a unit square (0–1) for a stylized map: x from longitude,
 * y from latitude (inverted so north is up). `pad` keeps pins off the edges. A single
 * point (or a degenerate axis) centers on that axis.
 */
export function mapPositions(
  points: MapPoint[],
  pad = 0.12,
): { id: string; nx: number; ny: number }[] {
  if (points.length === 0) return [];
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat;
  const spanLng = maxLng - minLng;
  const inner = 1 - pad * 2;

  return points.map((p) => ({
    id: p.id,
    nx: spanLng === 0 ? 0.5 : pad + ((p.lng - minLng) / spanLng) * inner,
    ny: spanLat === 0 ? 0.5 : pad + ((maxLat - p.lat) / spanLat) * inner,
  }));
}
