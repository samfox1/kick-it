import { Image } from 'expo-image';
import { Navigation } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Spot } from '@/domain/models';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { ScoreBubble } from '@/ui/ScoreBubble';

/** The selected-spot card shown over the map (shared by the native + web SpotsMap). */
export function SpotsCallout({ spot, onOpen }: { spot: Spot; onOpen: (spot: Spot) => void }) {
  return (
    <Pressable style={styles.callout} onPress={() => onOpen(spot)}>
      <Image source={{ uri: spot.image }} style={styles.calloutImg} contentFit="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.calloutName} numberOfLines={1}>
          {spot.name}
        </Text>
        <View style={styles.calloutMetaRow}>
          <Navigation size={12} color={colors.blue} strokeWidth={2.4} />
          <Text style={styles.calloutMeta} numberOfLines={1}>
            {spot.distanceMi} mi · {spot.category}
          </Text>
        </View>
      </View>
      <ScoreBubble score={spot.score} size="md" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
