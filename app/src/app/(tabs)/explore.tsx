import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bookmark, MapPin, Navigation, Plus, SlidersHorizontal, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHARACTERISTICS } from '@/domain/characteristics';
import { crewSpots, exploreCatalog, nearbySpots } from '@/domain/exploreView';
import type { Spot } from '@/domain/models';
import { topEndorsed } from '@/domain/vouch';
import { haptics } from '@/lib/haptics';
import { useLocationPermission } from '@/lib/useLocation';
import { useSpotsStore } from '@/store/spotsStore';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { AccessSticker } from '@/ui/AccessSticker';
import { CategoryBadge } from '@/ui/CategoryBadge';
import { EmptyState } from '@/ui/EmptyState';
import { PreferencesPanel } from '@/ui/PreferencesPanel';
import { ScoreBubble } from '@/ui/ScoreBubble';
import bench from '../../../assets/images/bench.png';

type Tab = 'public' | 'crew';

const SWIPE_THRESHOLD = 120;
const OFF_SCREEN = 600;

/** A single full-bleed spot card in the swipe deck. Detail (name/badges) shows only on top. */
function DeckCard({ spot, top, onOpen }: { spot: Spot; top: boolean; onOpen?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && top && pressedStyle]}
      onPress={onOpen}
      disabled={!top}
    >
      <Image
        source={{ uri: spot.image }}
        style={styles.cardImg}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.cardTop}>
        <AccessSticker access={spot.access} />
        <ScoreBubble score={spot.score} size="lg" />
      </View>
      {top && (
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>
            {spot.name}
          </Text>
          <View style={styles.cardMetaRow}>
            <Navigation size={14} color={colors.blue} strokeWidth={2.4} />
            <Text style={styles.cardMeta} numberOfLines={1}>
              {spot.distanceMi} mi · {spot.category} · {spot.location}
            </Text>
          </View>
          <View style={styles.cardBadges}>
            {topEndorsed(spot.vouchCounts ?? {}, spot.characteristicIds, 4).map((id) => (
              <CategoryBadge key={id} id={id} />
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { local, mine, saved, loaded, load, preferences, setMaxDistance, toggleNonNegotiable } =
    useSpotsStore();
  const { state: locationState, request } = useLocationPermission();
  const [tab, setTab] = useState<Tab>('public');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  // The currently-on-top spot, in a ref so the PanResponder (created once) always sees the latest.
  const topSpotRef = useRef<Spot | undefined>(undefined);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const flashSavedToast = () => {
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const maxMi = preferences.maxDistanceMi;
  const nonNeg = preferences.nonNegotiables;
  // Discovery shows only spots you haven't collected yet, so swipe-to-save always saves.
  const ownedIds = new Set([...mine, ...saved].map((s) => s.id));
  const catalog = exploreCatalog(local, mine).filter((s) => !ownedIds.has(s.id));
  const list = tab === 'public' ? nearbySpots(catalog, maxMi, nonNeg) : crewSpots(catalog, nonNeg);

  // Start the deck over whenever the tab or filters change the set of spots.
  useEffect(() => {
    setIndex(0);
    pan.setValue({ x: 0, y: 0 });
  }, [tab, maxMi, nonNeg, pan]);

  const forceSwipe = (dir: 'left' | 'right') => {
    // Swipe right (or the bookmark) saves the spot to your collection; left passes.
    if (dir === 'right' && topSpotRef.current) {
      useSpotsStore.getState().saveSpot(topSpotRef.current);
      haptics.success();
      flashSavedToast();
    } else {
      haptics.tick();
    }
    Animated.timing(pan, {
      toValue: { x: dir === 'right' ? OFF_SCREEN : -OFF_SCREEN, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setIndex((i) => i + 1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) forceSwipe('right');
        else if (g.dx < -SWIPE_THRESHOLD) forceSwipe('left');
        else
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
      },
    }),
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-OFF_SCREEN, 0, OFF_SCREEN],
    outputRange: ['-12deg', '0deg', '12deg'],
  });
  const saveOpacity = pan.x.interpolate({
    inputRange: [20, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = pan.x.interpolate({
    inputRange: [-100, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const visible = list.slice(index, index + 3);
  topSpotRef.current = visible[0];

  const open = (spot: Spot) => router.push({ pathname: '/spot/[id]', params: { id: spot.id } });

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.topRow}>
        {/* One big toggle: public spots vs your crew's spots */}
        <View style={styles.toggle}>
          <Pressable
            style={({ pressed }) => [
              styles.toggleHalf,
              tab === 'public' && styles.toggleOn,
              pressed && pressedStyle,
            ]}
            onPress={() => setTab('public')}
          >
            <Text style={[styles.toggleText, tab === 'public' && styles.toggleTextOn]}>Public</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.toggleHalf,
              tab === 'crew' && styles.toggleOn,
              pressed && pressedStyle,
            ]}
            onPress={() => setTab('crew')}
          >
            <Text style={[styles.toggleText, tab === 'crew' && styles.toggleTextOn]}>Crew</Text>
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.filterBtn,
            filtersOpen && styles.filterBtnOn,
            pressed && pressedStyle,
          ]}
          onPress={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal
            size={18}
            color={filtersOpen ? '#fff' : colors.ink}
            strokeWidth={2.2}
          />
          {nonNeg.length > 0 && (
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{nonNeg.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        {locationState === 'checking' && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.ink} />
          </View>
        )}

        {locationState === 'denied' && (
          <View style={styles.gate}>
            <View style={styles.gateIcon}>
              <MapPin size={30} color={colors.blue} strokeWidth={2.2} />
            </View>
            <Text style={styles.gateTitle}>Turn on location</Text>
            <Text style={styles.gateBody}>
              Kick It shows spots you can actually get to. Share your location and we&apos;ll keep
              it to places within reach — no endless scroll.
            </Text>
            <Pressable style={styles.gateBtn} onPress={request}>
              <Text style={styles.gateBtnText}>Enable location</Text>
            </Pressable>
          </View>
        )}

        {locationState === 'granted' && (
          <View style={styles.deck}>
            {visible.length === 0 ? (
              <EmptyState
                source={bench}
                title={
                  list.length === 0
                    ? tab === 'public'
                      ? 'Nothing in range'
                      : 'No crew spots yet'
                    : 'You’re all caught up'
                }
                subtitle={
                  list.length === 0
                    ? tab === 'public'
                      ? `No public spots within ${maxMi} mi that match your filters.`
                      : 'When your crew posts spots, they’ll show up here.'
                    : 'Take a seat and chill out — more spots are coming soon.'
                }
              />
            ) : (
              <>
                {visible
                  .map((spot, depth) => {
                    if (depth === 0) {
                      return (
                        <Animated.View
                          key={spot.id}
                          style={[
                            styles.cardLayer,
                            {
                              transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
                            },
                          ]}
                          {...panResponder.panHandlers}
                        >
                          <DeckCard spot={spot} top onOpen={() => open(spot)} />
                          <Animated.View
                            style={[styles.tag, styles.tagSave, { opacity: saveOpacity }]}
                            pointerEvents="none"
                          >
                            <Text style={[styles.tagText, { color: '#15803d' }]}>SAVE</Text>
                          </Animated.View>
                          <Animated.View
                            style={[styles.tag, styles.tagPass, { opacity: passOpacity }]}
                            pointerEvents="none"
                          >
                            <Text style={[styles.tagText, { color: colors.like }]}>PASS</Text>
                          </Animated.View>
                        </Animated.View>
                      );
                    }
                    return (
                      <View
                        key={spot.id}
                        style={[
                          styles.cardLayer,
                          { transform: [{ scale: 1 - depth * 0.04 }, { translateY: depth * 12 }] },
                        ]}
                      >
                        <DeckCard spot={spot} top={false} />
                      </View>
                    );
                  })
                  .reverse()}

                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && pressedStyle]}
                    onPress={() => forceSwipe('left')}
                  >
                    <X size={26} color={colors.ink} strokeWidth={2.6} />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.actionAdd,
                      pressed && pressedStyle,
                    ]}
                    accessibilityLabel="Log a hang here"
                    onPress={() => {
                      const t = topSpotRef.current;
                      if (t) router.push({ pathname: '/add', params: { spotId: t.id } });
                    }}
                  >
                    <Plus size={30} color="#fff" strokeWidth={2.6} />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && pressedStyle]}
                    onPress={() => forceSwipe('right')}
                  >
                    <Bookmark size={26} color={colors.ink} strokeWidth={2.4} />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {filtersOpen && (
          <View style={styles.panelOverlay}>
            <Pressable style={styles.panelBackdrop} onPress={() => setFiltersOpen(false)} />
            <View style={styles.panelCard}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                <PreferencesPanel
                  maxMi={maxMi}
                  onMaxDistance={setMaxDistance}
                  minMi={1}
                  maxLimit={50}
                  step={1}
                  showDistance={tab === 'public'}
                  ids={CHARACTERISTICS.map((c) => c.id)}
                  selected={nonNeg}
                  onToggle={toggleNonNegotiable}
                />
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Bookmark size={15} color="#fff" strokeWidth={2.4} />
        <Text style={styles.toastText}>Saved to your spots</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const TOP_H = 48;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    height: TOP_H,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    ...inkBorder,
    ...hardShadow(3),
  },
  toggleHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  toggleOn: { backgroundColor: colors.blue },
  toggleText: { fontFamily: font.extrabold, fontSize: 16, color: colors.ink },
  toggleTextOn: { color: '#fff' },
  filterBtn: {
    width: TOP_H,
    height: TOP_H,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(3),
  },
  filterBtnOn: { backgroundColor: colors.blue },
  filterCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.like,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
  },
  filterCountText: { fontFamily: font.extrabold, fontSize: 9, color: '#fff' },
  body: { flex: 1 },
  panelOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 },
  panelBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  panelCard: {
    position: 'absolute',
    top: 8,
    left: 14,
    right: 14,
    bottom: 104,
    padding: 16,
    borderRadius: radii.xl,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(5),
  },
  toast: {
    position: 'absolute',
    bottom: 104,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    ...hardShadow(3),
  },
  toastText: { fontFamily: font.extrabold, fontSize: 13.5, color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gate: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 50 },
  gateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(3),
  },
  gateTitle: { fontFamily: font.extrabold, fontSize: 20, color: colors.ink, marginTop: 16 },
  gateBody: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  gateBtn: {
    marginTop: 20,
    backgroundColor: colors.blue,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: radii.md,
    ...inkBorder,
    ...hardShadow(4),
  },
  gateBtnText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
  deck: { flex: 1, marginHorizontal: 18, marginTop: 14, marginBottom: 112 },
  cardLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 84 },
  card: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    ...inkBorder,
    ...hardShadow(5),
  },
  cardImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardInfo: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(3),
  },
  cardName: { fontFamily: font.extrabold, fontSize: 20, letterSpacing: -0.4, color: colors.ink },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  cardMeta: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.muted },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 7, rowGap: 8, marginTop: 9 },
  actions: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  tag: {
    position: 'absolute',
    top: 70,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...inkBorder,
  },
  tagSave: { left: 18, transform: [{ rotate: '-12deg' }] },
  tagPass: { right: 18, transform: [{ rotate: '12deg' }] },
  tagText: { fontFamily: font.extrabold, fontSize: 22, letterSpacing: 1 },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(4),
  },
  actionAdd: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.blue },
});
