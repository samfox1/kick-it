import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Spot } from '@/domain/models';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { ScoreBubble } from '@/ui/ScoreBubble';

/** A ranking-list row: leads with the score; tapping opens the spot page. */
export function SpotRow({
  spot,
  rank,
  onLongPress,
  active,
}: {
  spot: Spot;
  rank?: number;
  /** Long-press handler (used to start a drag-to-reorder). */
  onLongPress?: () => void;
  /** Whether this row is currently being dragged. */
  active?: boolean;
}) {
  const router = useRouter();
  const meta = rank !== undefined ? spot.category : `${spot.category} · ${spot.distanceMi} mi`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, active && styles.cardActive, pressed && pressedStyle]}
      accessibilityLabel={`View ${spot.name}`}
      onPress={() => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })}
      onLongPress={onLongPress}
      delayLongPress={180}
    >
      <View style={styles.top}>
        <Image
          source={{ uri: spot.image }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {spot.name}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
        <ScoreBubble score={spot.score} size="md" />
        <ChevronRight size={18} color="#bbb" strokeWidth={2.5} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    marginBottom: 14,
    ...inkBorder,
    ...hardShadow(4),
  },
  cardActive: { borderColor: colors.blue, ...hardShadow(6) },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11 },
  thumb: { width: 56, height: 56, borderRadius: 13, ...inkBorder },
  info: { flex: 1, minWidth: 0 },
  name: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  meta: { fontFamily: font.semibold, fontSize: 11.5, color: colors.muted, marginTop: 2 },
});
