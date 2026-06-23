import { Image, type ImageSource } from 'expo-image';
import { Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { Spot } from '@/domain/models';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { EmptyState } from '@/ui/EmptyState';
import { ScoreBubble } from '@/ui/ScoreBubble';

/** A region that frames all the given coordinates, with a little padding. */
function regionFor(coords: { lat: number; lng: number }[]): Region {
  const lats = coords.map((c) => c.lat);
  const lngs = coords.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
  };
}

/**
 * Real map (Apple Maps on iOS, Google on Android) with a marker per located spot. Tap a marker
 * to select it; the brand callout card slides in at the bottom; tap it to open the spot.
 * Web uses SpotsMap.web.tsx (a stylized grid) since react-native-maps has no web support.
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const located = spots.filter((s) => s.lat != null && s.lng != null);
  const selected = located.find((s) => s.id === selectedId);

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
    <View style={styles.wrap}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={regionFor(located.map((s) => ({ lat: s.lat!, lng: s.lng! })))}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedId(null)}
      >
        {located.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.lat!, longitude: s.lng! }}
            pinColor={colors.blue}
            onPress={() => setSelectedId(s.id)}
          />
        ))}
      </MapView>

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
  wrap: {
    flex: 1,
    margin: 18,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.soft,
    ...inkBorder,
  },
  callout: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
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
