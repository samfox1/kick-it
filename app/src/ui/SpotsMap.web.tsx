import { Image, type ImageSource } from 'expo-image';
import { Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { mapPositions } from '@/domain/mapView';
import type { Spot } from '@/domain/models';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { EmptyState } from '@/ui/EmptyState';
import { ScoreBubble } from '@/ui/ScoreBubble';

/**
 * Web build of SpotsMap. react-native-maps has no web support, so on the web we keep the
 * stylized neighborhood grid (spots pinned by lat/lng). The native SpotsMap.tsx renders a
 * real map. Metro picks this file automatically on web.
 */
export function SpotsMap({
  spots,
  emptySource,
  onOpen,
}: {
  spots: Spot[];
  emptySource: ImageSource;
  onOpen: (spot: Spot) => void;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = spots.filter((s) => s.lat != null && s.lng != null);
  const positions = mapPositions(located.map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng! })));
  const byId = new Map(located.map((s) => [s.id, s]));
  const selected = selectedId ? byId.get(selectedId) : undefined;

  if (located.length === 0) {
    return (
      <EmptyState
        source={emptySource}
        title="No spots to map"
        subtitle="Spots with a location will show up here."
      />
    );
  }

  return (
    <View
      style={styles.map}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {/* Tapping empty map closes the selected spot's card. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedId(null)} />

      {/* faint grid so it reads as a map */}
      {[0.25, 0.5, 0.75].map((f) => (
        <View key={`h${f}`} pointerEvents="none" style={[styles.gridH, { top: `${f * 100}%` }]} />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <View key={`v${f}`} pointerEvents="none" style={[styles.gridV, { left: `${f * 100}%` }]} />
      ))}

      {/* you-are-here */}
      <View style={styles.hereWrap} pointerEvents="none">
        <View style={styles.here} />
      </View>

      {size.w > 0 &&
        positions.map((p) => {
          const spot = byId.get(p.id);
          if (!spot) return null;
          const on = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              style={[
                styles.pin,
                { left: p.nx * size.w - 21, top: p.ny * size.h - 21, zIndex: on ? 5 : 1 },
              ]}
              onPress={() => setSelectedId(on ? null : p.id)}
            >
              <Image
                source={{ uri: spot.image }}
                style={[styles.pinImg, on && styles.pinImgOn]}
                contentFit="cover"
                transition={120}
              />
            </Pressable>
          );
        })}

      {selected && (
        <Pressable style={styles.callout} onPress={() => onOpen(selected)}>
          <Image source={{ uri: selected.image }} style={styles.calloutImg} contentFit="cover" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.calloutName} numberOfLines={1}>
              {selected.name}
            </Text>
            <View style={styles.calloutMetaRow}>
              <Navigation size={12} color={colors.blue} strokeWidth={2.4} />
              <Text style={styles.calloutMeta} numberOfLines={1}>
                {selected.distanceMi} mi · {selected.category}
              </Text>
            </View>
          </View>
          <ScoreBubble score={selected.score} size="md" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    margin: 18,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.soft,
    ...inkBorder,
  },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#e2e2dd' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#e2e2dd' },
  hereWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: 'rgba(37,99,235,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  here: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue, ...inkBorder },
  pin: { position: 'absolute' },
  pinImg: { width: 42, height: 42, borderRadius: 21, ...inkBorder, ...hardShadow(2) },
  pinImgOn: { borderColor: colors.blue, borderWidth: 3 },
  callout: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(4),
    elevation: 20,
  },
  calloutImg: { width: 48, height: 48, borderRadius: 24, ...inkBorder },
  calloutName: { fontFamily: font.extrabold, fontSize: 16, color: colors.ink },
  calloutMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  calloutMeta: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.muted },
});
