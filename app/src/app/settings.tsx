import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Share2,
  Star,
  UserPen,
  Users,
} from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usingSupabase } from '@/data/repositories';
import { signOutToGuest } from '@/lib/authFlow';
import { shareInvite } from '@/lib/invite';
import { useLocationPermission } from '@/lib/useLocation';
import { useProfileStore } from '@/store/profileStore';
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
  const email = useProfileStore((s) => s.email);
  const [signingOut, setSigningOut] = useState(false);
  const { state: locationState, request: requestLocation } = useLocationPermission();

  const onSignOut = async () => {
    if (!usingSupabase) return router.replace('/');
    setSigningOut(true);
    await signOutToGuest();
    setSigningOut(false);
    router.back();
  };

  // Location is an OS permission: prompt if undecided, otherwise deep-link to OS settings
  // (you can't toggle a granted/denied permission off from inside the app).
  const onLocationPress = async () => {
    if (locationState === 'granted' || locationState === 'denied') {
      void Linking.openSettings();
      return;
    }
    await requestLocation();
  };
  const locationLabel =
    locationState === 'granted' ? 'On' : locationState === 'denied' ? 'Off' : '…';

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
          {usingSupabase &&
            (email ? (
              <>
                <Row icon={<Mail size={18} color={colors.ink} strokeWidth={2} />} label={email} />
                <View style={styles.divider} />
              </>
            ) : (
              <>
                <Row
                  icon={<LogIn size={18} color={colors.ink} strokeWidth={2} />}
                  label="Sign in or create account"
                  onPress={() => router.push('/auth')}
                />
                <View style={styles.divider} />
              </>
            ))}
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
            icon={<MapPin size={18} color={colors.ink} strokeWidth={2} />}
            label="Share my location"
            onPress={onLocationPress}
            right={
              <View style={styles.rowRight}>
                <Text style={styles.statusText}>{locationLabel}</Text>
                <ChevronRight size={18} color={colors.muted2} strokeWidth={2} />
              </View>
            }
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

        {(!usingSupabase || email) && (
          <Pressable
            style={[styles.signOut, signingOut && { opacity: 0.6 }]}
            onPress={onSignOut}
            disabled={signingOut}
          >
            <LogOut size={18} color={colors.like} strokeWidth={2} />
            <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
          </Pressable>
        )}

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
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontFamily: font.bold, fontSize: 14, color: colors.muted },
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
