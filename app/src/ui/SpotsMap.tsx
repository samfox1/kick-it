import { type ImageSource } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { Spot } from '@/domain/models';
import { colors, inkBorder, radii } from '@/theme/tokens';
import { EmptyState } from '@/ui/EmptyState';
import { SpotsCallout } from '@/ui/SpotsCallout';

// Full grayscale for Google Maps (Android). Apple Maps can't be custom-styled, so iOS uses
// the built-in `mutedStandard` map type instead (desaturated, fits the ink look).
const GRAYSCALE_STYLE = [{ stylers: [{ saturation: -100 }] }];

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
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        customMapStyle={Platform.OS === 'android' ? GRAYSCALE_STYLE : undefined}
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

      {selected && <SpotsCallout spot={selected} onOpen={onOpen} />}
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
});
