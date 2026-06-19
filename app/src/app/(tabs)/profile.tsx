import { useRouter } from 'expo-router';
import { Settings, SquarePen } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SEED } from '@/data/mock/seed';
import { useHangDelete } from '@/lib/useHangDelete';
import { useProfileStore } from '@/store/profileStore';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import { useCrewStore } from '@/store/crewStore';
import { useHangsStore } from '@/store/hangsStore';
import { useSpotsStore } from '@/store/spotsStore';
import {
  accentRamp,
  colors,
  font,
  hardShadow,
  inkBorder,
  pressedStyle,
  radii,
} from '@/theme/tokens';
import { Avatar, memberColor } from '@/ui/Avatar';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { EmptyState } from '@/ui/EmptyState';
import { HangCard } from '@/ui/HangCard';
import { Segmented } from '@/ui/Segmented';
import { SpotRow } from '@/ui/SpotRow';
import beanbag from '../../../assets/images/beanbag.png';
import couch from '../../../assets/images/couch_image.png';

type Tab = 'saved' | 'hangs';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const { saved, local, mine, loaded, load } = useSpotsStore();
  const members = useCrewStore((s) => s.members);
  const requests = useCrewStore((s) => s.requests);
  const myHangs = useHangsStore((s) => s.hangs).filter((h) => h.author.id === profile.member.id);
  const loadMineHangs = useHangsStore((s) => s.loadMine);
  const loadMyReactions = useHangsStore((s) => s.loadMyReactions);
  const { requestDelete, confirmProps } = useHangDelete();
  const [tab, setTab] = useState<Tab>('saved');
  const onScroll = useHideOnScroll();

  // Resolve a hang's spot name for the "@spot" label. SEED covers every seeded
  // spot; store collections cover anything added/loaded this session.
  const spotNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of [...SEED.local, ...SEED.mine, ...local, ...mine, ...saved]) m.set(s.id, s.name);
    return m;
  }, [local, mine, saved]);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  useEffect(() => {
    void loadMineHangs();
    void loadMyReactions();
  }, [loadMineHangs, loadMyReactions]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.profileRow}>
          <Avatar label={profile.member.initial} color={accentRamp[0]} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.member.name}</Text>
            <Text style={styles.handle}>{profile.handle}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
            accessibilityLabel="Edit profile"
            onPress={() => router.push('/edit-profile')}
          >
            <SquarePen size={19} color={colors.ink} strokeWidth={2} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
          >
            <Settings size={19} color={colors.ink} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.crewRow}>
          <Pressable style={styles.stack} onPress={() => router.push('/crew')}>
            {members.slice(0, 5).map((m, i) => (
              <View key={m.id} style={i === 0 ? undefined : styles.stacked}>
                <Avatar label={m.initial} color={memberColor(m)} size={38} />
              </View>
            ))}
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && pressedStyle]}
            onPress={() => router.push('/crew')}
          >
            <Text style={styles.editText}>
              {requests.length > 0 ? `Requests (${requests.length})` : 'Crew'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.seg}>
          <Segmented
            options={[
              { value: 'saved', label: 'Saved spots' },
              { value: 'hangs', label: 'Hangs' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {tab === 'saved' &&
          (saved.length === 0 ? (
            <EmptyState
              source={beanbag}
              title="No saved spots yet"
              subtitle="Pop a squat and save some spots."
            />
          ) : (
            saved.map((spot) => <SpotRow key={spot.id} spot={spot} />)
          ))}

        {tab === 'hangs' &&
          (myHangs.length === 0 ? (
            <EmptyState
              source={couch}
              title="No hangs logged yet"
              subtitle="Get horizontal and log a hang."
            />
          ) : (
            myHangs.map((h) => (
              <HangCard
                key={h.id}
                hang={h}
                spotName={spotNameById.get(h.spotId)}
                onPressSpot={() =>
                  router.push({ pathname: '/spot/[id]', params: { id: h.spotId } })
                }
                onEdit={() => router.push({ pathname: '/edit-hang', params: { id: h.id } })}
                onDelete={() => requestDelete(h.id, h.title)}
              />
            ))
          ))}
      </ScrollView>

      <ConfirmModal {...confirmProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  ico: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  name: { fontFamily: font.extrabold, fontSize: 21, letterSpacing: -0.3, color: colors.ink },
  handle: { fontFamily: font.semibold, fontSize: 13, color: colors.muted, marginTop: 2 },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  editText: { fontFamily: font.bold, fontSize: 13, color: colors.ink },
  crewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  stack: { flexDirection: 'row' },
  stacked: { marginLeft: -8 },
  seg: { marginTop: 18, marginBottom: 4 },
});
