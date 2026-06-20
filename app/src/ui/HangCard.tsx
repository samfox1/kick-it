import { Image } from 'expo-image';
import { Flame, Heart, Laugh, Pencil, Trash2 } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Hang, Member, ReactionKey } from '@/domain/models';
import { haptics } from '@/lib/haptics';
import { useRequireAccount } from '@/lib/useRequireAccount';
import { useCrewStore } from '@/store/crewStore';
import { useHangsStore } from '@/store/hangsStore';
import { useProfileStore } from '@/store/profileStore';
import { colors, font, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { AttendeesModal, type AttendeeRow } from '@/ui/AttendeesModal';
import { Avatar, memberColor } from '@/ui/Avatar';

/** Max avatars shown on the card before collapsing to "+N"; the modal lists everyone. */
const MAX_FACES = 5;

const REACTIONS: { key: ReactionKey; Icon: LucideIcon; color: string; fillWhenOn: boolean }[] = [
  { key: 'heart', Icon: Heart, color: colors.like, fillWhenOn: true },
  { key: 'fire', Icon: Flame, color: '#f59e0b', fillWhenOn: true },
  // Face icons go solid (the eyes/mouth get painted over) if filled — recolor the stroke instead.
  { key: 'haha', Icon: Laugh, color: colors.blue, fillWhenOn: false },
];

/** Small deterministic seed so non-heart reactions feel alive in the mock. */
function baseCount(id: string, key: ReactionKey): number {
  if (key === 'heart') return 0; // heart base comes from hang.likes
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const offset = key === 'fire' ? 1 : 2;
  return (h >> offset) % 5; // 0–4
}

/** One entry in a spot's Hang Ledger — a roomy, scrollable, reactable hang story. */
export function HangCard({
  hang,
  spotName,
  onPressSpot,
  onEdit,
  onDelete,
}: {
  hang: Hang;
  /** The spot this hang was logged at. Shown as an "@spot" link where the list
   *  mixes spots (e.g. your profile). Omit on a spot's own page — it's redundant. */
  spotName?: string;
  onPressSpot?: () => void;
  /** Provided only for your own hangs — shows edit/delete controls. */
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const active = useHangsStore((s) => s.reactions[hang.id]);
  const toggleReaction = useHangsStore((s) => s.toggleReaction);
  const requireAccount = useRequireAccount();
  const isOn = (key: ReactionKey) => active?.[key] ?? false;

  const toggle = (key: ReactionKey) => {
    if (!requireAccount('Sign in to react to hangs.')) return;
    if (!isOn(key)) haptics.bump();
    toggleReaction(hang.id, key);
  };

  // Show your live profile identity on your own hangs, so a rename updates them.
  const me = useProfileStore((s) => s.member);
  const author = hang.author.id === me.id ? me : hang.author;
  const crew = useCrewStore((s) => s.members);
  const invitedIds = useCrewStore((s) => s.invited);
  const sendInvite = useCrewStore((s) => s.invite);
  const [showPeople, setShowPeople] = useState(false);
  const peopleCount = hang.attendees.length + hang.extraAttendees;
  const hasPeople = peopleCount > 0;

  const attendeeRows: AttendeeRow[] = hang.attendees.map((m) => {
    let status: AttendeeRow['status'];
    if (m.id === me.id) status = 'you';
    else if (crew.some((c) => c.id === m.id)) status = 'friend';
    else if (invitedIds.includes(m.id)) status = 'invited';
    else status = 'invitable';
    return { member: m, status };
  });

  const invite = (m: Member) => {
    haptics.bump();
    sendInvite(m);
  };

  return (
    <View style={styles.card}>
      <View style={styles.posterRow}>
        <Avatar label={author.initial} color={memberColor(author)} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.poster} numberOfLines={1}>
            {author.name}
          </Text>
          <Text style={styles.when}>{hang.when}</Text>
        </View>
        {onEdit && (
          <Pressable
            style={({ pressed }) => [styles.ownBtn, pressed && pressedStyle]}
            onPress={onEdit}
            accessibilityLabel="Edit hang"
          >
            <Pencil size={16} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            style={({ pressed }) => [styles.ownBtn, pressed && pressedStyle]}
            onPress={onDelete}
            accessibilityLabel="Delete hang"
          >
            <Trash2 size={16} color={colors.like} strokeWidth={2.2} />
          </Pressable>
        )}
      </View>

      {spotName ? (
        <Pressable
          onPress={onPressSpot}
          disabled={!onPressSpot}
          hitSlop={6}
          accessibilityRole={onPressSpot ? 'link' : undefined}
          accessibilityLabel={`At ${spotName}`}
        >
          <Text style={styles.at} numberOfLines={1}>
            @{spotName}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>{hang.title}</Text>
      <Text style={styles.note}>{hang.note}</Text>

      <Image
        source={{ uri: hang.image }}
        style={styles.photo}
        contentFit="cover"
        transition={150}
      />

      <View style={styles.foot}>
        <Pressable
          style={({ pressed }) => [styles.stack, pressed && hasPeople && pressedStyle]}
          onPress={() => setShowPeople(true)}
          disabled={!hasPeople}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="See who was there"
        >
          {hang.attendees.slice(0, MAX_FACES).map((m, i) => (
            <View key={m.id} style={i === 0 ? undefined : styles.stacked}>
              <Avatar label={m.initial} color={memberColor(m)} size={34} />
            </View>
          ))}
          {peopleCount - Math.min(hang.attendees.length, MAX_FACES) > 0 && (
            <View style={styles.stacked}>
              <Avatar
                label={`+${peopleCount - Math.min(hang.attendees.length, MAX_FACES)}`}
                color={colors.slate}
                size={34}
              />
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={styles.reactions}>
          {REACTIONS.map(({ key, Icon, color, fillWhenOn }) => {
            const on = isOn(key);
            const base = key === 'heart' ? hang.likes : baseCount(hang.id, key);
            const count = base + (on ? 1 : 0);
            return (
              <Pressable
                key={key}
                style={styles.reaction}
                onPress={() => toggle(key)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`React ${key}`}
              >
                <Icon
                  size={22}
                  color={on ? color : colors.muted}
                  fill={on && fillWhenOn ? color : 'transparent'}
                  strokeWidth={2.2}
                />
                {count > 0 && <Text style={[styles.count, on && { color }]}>{count}</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      <AttendeesModal
        visible={showPeople}
        rows={attendeeRows}
        extraCount={hang.extraAttendees}
        onInvite={invite}
        onClose={() => setShowPeople(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 24,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.soft,
  },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  ownBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
  },
  poster: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.ink },
  when: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 1 },
  at: {
    fontFamily: font.bold,
    fontSize: 13.5,
    color: colors.blue,
    marginBottom: 6,
  },
  title: {
    fontFamily: font.extrabold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.ink,
    marginBottom: 6,
  },
  note: {
    fontFamily: font.medium,
    fontSize: 15.5,
    lineHeight: 23,
    color: colors.ink,
  },
  photo: {
    width: '100%',
    height: 230,
    borderRadius: radii.lg,
    marginTop: 16,
    ...inkBorder,
  },
  foot: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  stack: { flexDirection: 'row' },
  stacked: { marginLeft: -10 },
  reactions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  reaction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  count: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.muted },
});
