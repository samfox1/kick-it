import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Lock,
  LogOut,
  MapPin,
  Share2,
  Star,
  UserPen,
  Users,
} from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shareInvite } from '@/lib/invite';
import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';

function Row({
  icon,
  label,
  onPress,
  right,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress && !right}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowLabel, danger && { color: colors.like }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {right ?? (onPress ? <ChevronRight size={18} color={colors.muted2} strokeWidth={2} /> : null)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  const toggle = (v: boolean, set: (b: boolean) => void) => (
    <Switch
      value={v}
      onValueChange={set}
      trackColor={{ true: colors.blue, false: '#d4d4d4' }}
      thumbColor="#fff"
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.ico} onPress={() => router.back()}>
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.group}>Account</Text>
        <View style={styles.card}>
          <Row
            icon={<UserPen size={18} color={colors.ink} strokeWidth={2} />}
            label="Edit profile"
            onPress={() => router.push('/edit-profile')}
          />
          <View style={styles.divider} />
          <Row
            icon={<Users size={18} color={colors.ink} strokeWidth={2} />}
            label="Your crew"
            onPress={() => router.push('/crew')}
          />
        </View>

        <Text style={styles.group}>Preferences</Text>
        <View style={styles.card}>
          <Row
            icon={<Bell size={18} color={colors.ink} strokeWidth={2} />}
            label="Push notifications"
            right={toggle(notifications, setNotifications)}
          />
          <View style={styles.divider} />
          <Row
            icon={<MapPin size={18} color={colors.ink} strokeWidth={2} />}
            label="Share my location"
            right={toggle(location, setLocation)}
          />
          <View style={styles.divider} />
          <Row
            icon={<Lock size={18} color={colors.ink} strokeWidth={2} />}
            label="Private profile"
            right={toggle(privateProfile, setPrivateProfile)}
          />
        </View>

        <Text style={styles.group}>General</Text>
        <View style={styles.card}>
          <Row
            icon={<Share2 size={18} color={colors.ink} strokeWidth={2} />}
            label="Invite friends"
            onPress={shareInvite}
          />
          <View style={styles.divider} />
          <Row
            icon={<Star size={18} color={colors.ink} strokeWidth={2} />}
            label="Rate Kick It"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <Row
            icon={<CircleHelp size={18} color={colors.ink} strokeWidth={2} />}
            label="Help & feedback"
            onPress={() => {}}
          />
        </View>

        <Pressable style={styles.signOut} onPress={() => router.replace('/')}>
          <LogOut size={18} color={colors.like} strokeWidth={2} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.version}>Kick It v1.0.0 · mock build</Text>
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
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  group: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginTop: 22,
    marginBottom: 9,
    marginLeft: 4,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    ...inkBorder,
    ...hardShadow(3),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 54 },
  rowIcon: { width: 22, alignItems: 'center' },
  rowLabel: { fontFamily: font.bold, fontSize: 14.5, color: colors.ink },
  divider: { height: 1.5, backgroundColor: colors.soft, marginLeft: 48 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.like,
    ...hardShadow(3),
  },
  signOutText: { fontFamily: font.extrabold, fontSize: 15, color: colors.like },
  version: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.muted2,
    textAlign: 'center',
    marginTop: 22,
  },
});
