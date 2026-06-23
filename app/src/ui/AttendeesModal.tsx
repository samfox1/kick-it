import { Check, UserPlus } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Member } from '@/domain/models';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { Avatar, memberColor } from '@/ui/Avatar';

/** A person in the list plus their relationship to the current user. */
export type AttendeeRow = {
  member: Member;
  status: 'you' | 'friend' | 'invitable' | 'invited';
};

/**
 * Lists everyone who was at a hang. Crew members show as "In your crew"; people you
 * don't know yet get an Invite button (the "invite list"). Matches the Kick It look.
 */
export function AttendeesModal({
  visible,
  rows,
  extraCount,
  onInvite,
  onClose,
}: {
  visible: boolean;
  rows: AttendeeRow[];
  /** Anonymous "+N" attendees with no profile to show. */
  extraCount: number;
  onInvite: (member: Member) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Who was there</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {rows.map(({ member, status }) => (
              <View key={member.id} style={styles.row}>
                <Avatar
                  label={member.initial}
                  color={memberColor(member)}
                  size={36}
                  uri={member.avatar}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {member.name}
                </Text>
                {status === 'you' && <Text style={styles.muted}>You</Text>}
                {status === 'friend' && <Text style={styles.muted}>In your crew</Text>}
                {status === 'invited' && (
                  <View style={styles.invited}>
                    <Check size={15} color={colors.muted} strokeWidth={2.5} />
                    <Text style={styles.muted}>Invited</Text>
                  </View>
                )}
                {status === 'invitable' && (
                  <Pressable
                    style={({ pressed }) => [styles.inviteBtn, pressed && pressedStyle]}
                    onPress={() => onInvite(member)}
                    accessibilityRole="button"
                    accessibilityLabel={`Invite ${member.name}`}
                  >
                    <UserPlus size={15} color={colors.paper} strokeWidth={2.5} />
                    <Text style={styles.inviteText}>Invite</Text>
                  </Pressable>
                )}
              </View>
            ))}

            {extraCount > 0 && (
              <View style={styles.row}>
                <Avatar label={`+${extraCount}`} color={colors.slate} size={36} />
                <Text style={styles.name}>{extraCount} more</Text>
              </View>
            )}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && pressedStyle]}
            onPress={onClose}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: 22,
    ...inkBorder,
    ...hardShadow(5),
  },
  title: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  list: { marginTop: 14, flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 7 },
  name: { flex: 1, minWidth: 0, fontFamily: font.bold, fontSize: 15, color: colors.ink },
  muted: { fontFamily: font.semibold, fontSize: 13, color: colors.muted },
  invited: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.blue,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    ...inkBorder,
  },
  inviteText: { fontFamily: font.bold, fontSize: 13, color: colors.paper },
  doneBtn: {
    marginTop: 18,
    backgroundColor: colors.paper,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    ...inkBorder,
  },
  doneText: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
});
