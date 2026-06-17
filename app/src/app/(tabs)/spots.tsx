import { useRouter } from 'expo-router';
import { ChevronDown, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';

import { scoreForReorder } from '@/domain/rankInsert';
import type { Spot } from '@/domain/models';
import { visibleLocalSpots, visibleMySpots } from '@/domain/spotsView';
import { haptics } from '@/lib/haptics';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import { useSpotsStore } from '@/store/spotsStore';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';
import { PreferencesPanel } from '@/ui/PreferencesPanel';
import { Segmented } from '@/ui/Segmented';
import { SpotRow } from '@/ui/SpotRow';
import { SpotsMap } from '@/ui/SpotsMap';
import bench from '../../../assets/images/bench.png';

const PREF_OPTIONS = ['aux', 'charging', 'cannabis', 'free', 'biggroup', 'dog'];

export default function SpotsScreen() {
  const {
    collection,
    local,
    mine,
    preferences,
    loaded,
    load,
    setCollection,
    setMaxDistance,
    toggleNonNegotiable,
    rankSpot,
  } = useSpotsStore();
  const router = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const onScroll = useHideOnScroll();
  const openSpot = (spot: Spot) => router.push({ pathname: '/spot/[id]', params: { id: spot.id } });

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
  );

  const spots =
    collection === 'local' ? visibleLocalSpots(local, preferences) : visibleMySpots(mine);
  const count =
    collection === 'local' ? `${spots.length} spots near you` : `${spots.length} spots in your map`;
  const prefLabel =
    collection === 'local' ? 'Preferences for local spots' : 'Preferences for my spots';

  const header = (
    <>
      <View style={styles.titleRow}>
        <Text style={styles.title}>the Spots</Text>
        <View style={styles.viewToggle}>
          <Pressable
            style={[styles.viewBtn, view === 'list' && styles.viewBtnOn]}
            onPress={() => setView('list')}
            accessibilityLabel="List view"
          >
            <List size={18} color={view === 'list' ? '#fff' : colors.ink} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={[styles.viewBtn, view === 'map' && styles.viewBtnOn]}
            onPress={() => setView('map')}
            accessibilityLabel="Map view"
          >
            <MapIcon size={18} color={view === 'map' ? '#fff' : colors.ink} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <Segmented
        options={[
          { value: 'local', label: 'Local spots' },
          { value: 'mine', label: 'My spots' },
        ]}
        value={collection}
        onChange={setCollection}
      />

      <Pressable style={styles.prefBtn} onPress={() => setPrefsOpen((o) => !o)}>
        <SlidersHorizontal size={16} color={colors.ink} strokeWidth={2} />
        <Text style={styles.prefBtnLabel}>{prefLabel}</Text>
        <ChevronDown
          size={18}
          color="#999"
          strokeWidth={2.5}
          style={prefsOpen ? styles.chevOpen : undefined}
        />
      </Pressable>

      {prefsOpen && (
        <View style={styles.prefs}>
          <PreferencesPanel
            maxMi={preferences.maxDistanceMi}
            onMaxDistance={setMaxDistance}
            minMi={0.5}
            maxLimit={15}
            step={0.5}
            showDistance={collection === 'local'}
            ids={PREF_OPTIONS}
            selected={preferences.nonNegotiables}
            onToggle={toggleNonNegotiable}
          />
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.count}>{count}</Text>
        {collection === 'mine' && spots.length > 1 && (
          <Text style={styles.reorderHint}>Hold a spot to reorder</Text>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {view === 'map' ? (
        <View style={styles.fill}>
          <View style={styles.mapHeader}>{header}</View>
          <View style={styles.mapArea}>
            <SpotsMap spots={spots} emptySource={bench} onOpen={openSpot} />
          </View>
        </View>
      ) : collection === 'mine' ? (
        <DraggableFlatList
          data={spots}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          ListHeaderComponent={<View>{header}</View>}
          activationDistance={14}
          onDragEnd={({ data, from, to }) => {
            if (from === to) return;
            haptics.bump();
            rankSpot(
              data[to],
              scoreForReorder(
                data.map((s) => s.score),
                to,
              ),
            );
          }}
          renderItem={({ item, drag, isActive, getIndex }) => (
            <ScaleDecorator>
              <SpotRow
                spot={item}
                rank={(getIndex() ?? 0) + 1}
                onLongPress={drag}
                active={isActive}
              />
            </ScaleDecorator>
          )}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={refreshControl}
        >
          {header}
          {spots.map((spot) => (
            <SpotRow key={spot.id} spot={spot} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120 },
  mapHeader: { paddingHorizontal: 18, paddingTop: 8 },
  mapArea: { flex: 1, marginBottom: 84 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.6 },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: radii.md,
    overflow: 'hidden',
    ...inkBorder,
    ...hardShadow(2),
  },
  viewBtn: {
    width: 42,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  viewBtnOn: { backgroundColor: colors.blue },
  prefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    ...inkBorder,
    ...hardShadow(2),
  },
  prefBtnLabel: { flex: 1, fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink },
  chevOpen: { transform: [{ rotate: '180deg' }] },
  prefs: {
    marginTop: 14,
    padding: 15,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    ...inkBorder,
    ...hardShadow(4),
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 14,
  },
  count: { fontFamily: font.bold, fontSize: 13, color: colors.muted },
  reorderHint: { fontFamily: font.semibold, fontSize: 12, color: colors.blue },
});
