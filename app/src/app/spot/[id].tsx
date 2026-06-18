import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, ListOrdered, Plus, Waves } from 'lucide-react-native';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isMe } from '@/store/profileStore';
import { spotGallery } from '@/domain/models';
import { haptics } from '@/lib/haptics';
import { useHangDelete } from '@/lib/useHangDelete';
import { useHangsStore } from '@/store/hangsStore';
import { useSpotsStore } from '@/store/spotsStore';
import { useSpotDetail } from '@/store/useSpotDetail';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { AccessSticker } from '@/ui/AccessSticker';
import { CategoryBadge } from '@/ui/CategoryBadge';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { HangCard } from '@/ui/HangCard';
import { ScoreBubble } from '@/ui/ScoreBubble';
import { Skeleton } from '@/ui/Skeleton';
import { SpotGallery } from '@/ui/SpotGallery';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spot: fetchedSpot, loading } = useSpotDetail(id);
  const savedSpots = useSpotsStore((s) => s.saved);
  const mine = useSpotsStore((s) => s.mine);
  const local = useSpotsStore((s) => s.local);
  const saveSpot = useSpotsStore((s) => s.saveSpot);
  const unsaveSpot = useSpotsStore((s) => s.unsaveSpot);
  // The store is the source of truth for any spot it holds, so in-app mutations
  // (e.g. re-ranking updates the score in `mine`) show here. Fall back to the
  // fetched copy for spots not in any collection (deep links).
  const spot =
    mine.find((s) => s.id === id) ??
    savedSpots.find((s) => s.id === id) ??
    local.find((s) => s.id === id) ??
    fetchedSpot;
  const allHangs = useHangsStore((s) => s.hangs);
  const hangs = allHangs.filter((h) => h.spotId === id);
  const { requestDelete, confirmProps } = useHangDelete();
  const endorsements = useSpotsStore((s) => s.endorsements);
  const toggleEndorsement = useSpotsStore((s) => s.toggleEndorsement);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (loading) {
    return (
      <View style={styles.root}>
        <Skeleton width="100%" height={340} radius={0} />
        <View style={styles.body}>
          <Skeleton width={220} height={26} />
          <Skeleton width={140} height={14} style={{ marginTop: 10 }} />
          <Skeleton width="100%" height={60} style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }
  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Spot not found.</Text>
      </View>
    );
  }

  const myEndorsements = endorsements[spot.id];
  const isSaved = savedSpots.some((s) => s.id === spot.id);
  const isRanked = mine.some((s) => s.id === spot.id);
  const toggleSave = () => {
    if (isSaved) {
      unsaveSpot(spot.id);
    } else {
      saveSpot(spot);
      haptics.bump();
    }
  };

  const heroParallax = {
    transform: [
      {
        scale: scrollY.interpolate({
          inputRange: [-200, 0],
          outputRange: [1.45, 1],
          extrapolateRight: 'clamp',
        }),
      },
      {
        translateY: scrollY.interpolate({
          inputRange: [-200, 0, 340],
          outputRange: [-40, 0, 110],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        <View style={styles.heroWrap}>
          <View style={styles.heroClip}>
            <Animated.View style={heroParallax}>
              <SpotGallery images={spotGallery(spot)} height={340} />
            </Animated.View>
          </View>
          <Pressable
            style={[styles.heroBtn, { top: insets.top + 10, left: 16 }]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
          </Pressable>
          {/* Saving only applies to spots not yet in your ranked list. */}
          {!isRanked && (
            <Pressable
              style={({ pressed }) => [
                styles.heroBtn,
                { top: insets.top + 10, right: 16 },
                isSaved && styles.heroBtnSaved,
                pressed && pressedStyle,
              ]}
              onPress={toggleSave}
              accessibilityRole="button"
              accessibilityState={{ selected: isSaved }}
            >
              <Bookmark
                size={20}
                color={isSaved ? colors.paper : colors.ink}
                fill={isSaved ? colors.paper : 'transparent'}
                strokeWidth={2}
              />
            </Pressable>
          )}
          <View style={styles.stickerOverlay}>
            <AccessSticker access={spot.access} />
          </View>
          <View style={styles.scoreOverlay}>
            <ScoreBubble score={spot.score} size="lg" />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{spot.name}</Text>
          <View style={styles.locRow}>
            <Waves size={16} color={colors.ink} strokeWidth={2} />
            <Text style={styles.loc}>
              {spot.location} · {spot.category}
            </Text>
          </View>

          {spot.description && <Text style={styles.desc}>{spot.description}</Text>}

          <Pressable
            style={({ pressed }) => [styles.rankBtn, pressed && pressedStyle]}
            onPress={() => router.push({ pathname: '/rank', params: { spotId: spot.id } })}
          >
            <ListOrdered size={18} color={colors.ink} strokeWidth={2.2} />
            <Text style={styles.rankBtnText}>
              {isRanked ? 'Re-rank this spot' : 'Rank this spot'}
            </Text>
          </Pressable>

          <Text style={styles.sectionH}>What people vouch for</Text>
          <Text style={styles.sub}>Tap a badge to endorse what&apos;s true.</Text>
          <View style={styles.badges}>
            {spot.characteristicIds.map((cid) => {
              const on = !!myEndorsements?.[cid];
              return (
                <CategoryBadge
                  key={cid}
                  id={cid}
                  count={(spot.vouchCounts?.[cid] ?? 0) + (on ? 1 : 0)}
                  endorsed={on}
                  onPress={() => toggleEndorsement(spot.id, cid)}
                />
              );
            })}
          </View>

          <View style={styles.ledgerHead}>
            <Text style={styles.sectionH}>The Hang Ledger</Text>
            <Text style={styles.when}>{hangs.length} hangs</Text>
          </View>
          <Pressable
            style={styles.logBtn}
            onPress={() => router.push({ pathname: '/add', params: { spotId: spot.id } })}
          >
            <Plus size={18} color="#fff" strokeWidth={2.4} />
            <Text style={styles.logBtnText}>Log a hang here</Text>
          </Pressable>
          {hangs.map((h) => {
            const mineHang = isMe(h.author.id);
            return (
              <HangCard
                key={h.id}
                hang={h}
                onEdit={
                  mineHang
                    ? () => router.push({ pathname: '/edit-hang', params: { id: h.id } })
                    : undefined
                }
                onDelete={mineHang ? () => requestDelete(h.id, h.title) : undefined}
              />
            );
          })}
        </View>
      </Animated.ScrollView>

      <ConfirmModal {...confirmProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  notFound: { fontFamily: font.bold, color: colors.muted },
  scroll: { paddingBottom: 40 },
  heroWrap: { borderBottomWidth: 2, borderColor: colors.ink },
  heroClip: { height: 340, overflow: 'hidden' },
  heroBtn: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  heroBtnSaved: { backgroundColor: colors.blue },
  stickerOverlay: { position: 'absolute', left: 16, bottom: 14 },
  scoreOverlay: { position: 'absolute', right: 16, bottom: -24 },
  body: { padding: 18, paddingTop: 30 },
  title: { fontFamily: font.extrabold, fontSize: 25, letterSpacing: -0.5, color: colors.ink },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 },
  loc: { fontFamily: font.semibold, fontSize: 13, color: colors.muted },
  desc: { fontFamily: font.medium, fontSize: 13, lineHeight: 20, color: colors.ink, marginTop: 16 },
  rankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(3),
  },
  rankBtnText: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  sectionH: {
    fontFamily: font.extrabold,
    fontSize: 18,
    letterSpacing: -0.3,
    color: colors.ink,
    marginTop: 24,
  },
  sub: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 7, rowGap: 12, marginTop: 10 },
  ledgerHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  when: { fontFamily: font.semibold, fontSize: 11, color: colors.muted },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.blue,
    paddingVertical: 13,
    borderRadius: radii.md,
    marginTop: 12,
    marginBottom: 14,
    ...inkBorder,
    ...hardShadow(4),
  },
  logBtnText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
});
