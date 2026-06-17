import { useRouter } from 'expo-router';
import { Check, ChevronLeft, UserPlus, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shareInvite } from '@/lib/invite';
import { useCrewStore } from '@/store/crewStore';
import { haptics } from '@/lib/haptics';
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

export default function CrewScreen() {
  const router = useRouter();
  const { members, requests, acceptRequest, denyRequest } = useCrewStore();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.ico, pressed && pressedStyle]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Your crew</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          style={({ pressed }) => [styles.inviteBtn, pressed && pressedStyle]}
          onPress={shareInvite}
        >
          <UserPlus size={18} color="#fff" strokeWidth={2.4} />
          <Text style={styles.inviteText}>Invite someone to your crew</Text>
        </Pressable>

        {requests.length > 0 && (
          <>
            <Text style={styles.section}>Requests ({requests.length})</Text>
            {requests.map((m, i) => (
              <View key={m.id} style={styles.row}>
                <Avatar label={m.initial} color={accentRamp[i % accentRamp.length]} size={40} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={styles.sub}>wants to join your crew</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.deny, pressed && pressedStyle]}
                  onPress={() => denyRequest(m.id)}
                  accessibilityLabel={`Deny ${m.name}`}
                >
                  <X size={18} color={colors.ink} strokeWidth={2.4} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.accept, pressed && pressedStyle]}
                  onPress={() => {
                    haptics.success();
                    acceptRequest(m.id);
                  }}
                  accessibilityLabel={`Accept ${m.name}`}
                >
                  <Check size={18} color="#fff" strokeWidth={2.6} />
                </Pressable>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>In your crew ({members.length})</Text>
        {members.map((m, i) => (
          <View key={m.id} style={styles.row}>
            <Avatar label={m.initial} color={accentRamp[i % accentRamp.length]} size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>{m.name}</Text>
              <Text style={styles.sub}>in your crew</Text>
            </View>
          </View>
        ))}
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
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.blue,
    ...inkBorder,
    ...hardShadow(4),
  },
  inviteText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
  section: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted2,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    marginBottom: 10,
    ...inkBorder,
    ...hardShadow(2),
  },
  name: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  sub: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 2 },
  deny: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  accept: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
});
