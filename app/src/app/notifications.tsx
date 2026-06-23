import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Heart,
  MapPin,
  Sparkles,
  ThumbsUp,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { createElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NOTIFICATIONS, type NotificationKind } from '@/data/mock/notifications';
import {
  accentRamp,
  colors,
  font,
  hardShadow,
  inkBorder,
  pressedStyle,
  radii,
} from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';

const ICON: Record<NotificationKind, LucideIcon> = {
  new_spot: MapPin,
  hang: Sparkles,
  endorse: ThumbsUp,
  crew: Users,
  like: Heart,
  rank: Trophy,
};

const TINT: Record<NotificationKind, string> = {
  new_spot: colors.blue,
  hang: '#6d28d9',
  endorse: '#1d4ed8',
  crew: '#15803d',
  like: colors.like,
  rank: '#c2620b',
};

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.ico} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.length === 0 ? (
          <View style={styles.empty}>
            <Bell size={28} color={colors.muted2} strokeWidth={2} />
            <Text style={styles.emptyText}>You’re all caught up.</Text>
          </View>
        ) : (
          NOTIFICATIONS.map((n, i) => (
            <Pressable
              key={n.id}
              style={({ pressed }) => [
                styles.row,
                n.unread && styles.rowUnread,
                pressed && n.spotId && pressedStyle,
              ]}
              disabled={!n.spotId}
              onPress={() =>
                n.spotId && router.push({ pathname: '/spot/[id]', params: { id: n.spotId } })
              }
            >
              <View style={styles.avatarWrap}>
                <Avatar
                  label={n.actorInitial}
                  color={accentRamp[i % accentRamp.length]}
                  size={40}
                  uri={n.actorAvatar}
                />
                <View style={[styles.kindDot, { backgroundColor: TINT[n.kind] }]}>
                  {createElement(ICON[n.kind], { size: 11, color: '#fff', strokeWidth: 2.6 })}
                </View>
              </View>
              <Text style={styles.text}>{n.text}</Text>
              <View style={styles.rightCol}>
                <Text style={styles.when}>{n.when}</Text>
                {n.unread && <View style={styles.unreadDot} />}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.ink,
  },
  content: { paddingHorizontal: 18, paddingBottom: 40, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    marginBottom: 10,
    ...inkBorder,
    ...hardShadow(2),
  },
  rowUnread: { backgroundColor: '#f3f7ff' },
  avatarWrap: { width: 40, height: 40 },
  kindDot: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
  },
  text: { flex: 1, fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.ink },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  when: { fontFamily: font.semibold, fontSize: 11, color: colors.muted },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue },
  empty: { alignItems: 'center', gap: 10, marginTop: 80 },
  emptyText: { fontFamily: font.semibold, fontSize: 14, color: colors.muted },
});
