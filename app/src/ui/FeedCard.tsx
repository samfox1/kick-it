import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bookmark, Heart, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeedItem, Member } from '@/domain/models';
import { useProfileStore } from '@/store/profileStore';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { AccessSticker } from '@/ui/AccessSticker';
import { Avatar, memberColor } from '@/ui/Avatar';
import { CategoryBadge } from '@/ui/CategoryBadge';
import { ScoreBubble } from '@/ui/ScoreBubble';

function Poster({ by, line, when }: { by: Member; line: string; when: string }) {
  return (
    <View style={styles.poster}>
      <Avatar label={by.initial} color={memberColor(by)} size={38} />
      <View style={{ flex: 1 }}>
        <Text style={styles.posterLine}>{line}</Text>
        <Text style={styles.when}>{when}</Text>
      </View>
    </View>
  );
}

/** Renders one activity-feed entry (new spot / hang / re-rank). The whole card opens the spot. */
export function FeedCard({ item }: { item: FeedItem }) {
  const router = useRouter();
  const me = useProfileStore((s) => s.member);
  const openSpot = () => router.push({ pathname: '/spot/[id]', params: { id: item.spotId } });
  // The feed payload is a frozen snapshot; show your live identity on your own items so a
  // rename reflects immediately (mirrors HangCard).
  const by = item.by.id === me.id ? me : item.by;

  if (item.kind === 'new_spot') {
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && pressedStyle]} onPress={openSpot}>
        <View style={styles.posterRow}>
          <Poster by={by} line={`${by.name} added a new spot`} when={item.when} />
          <AccessSticker access={item.access} />
        </View>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.scoreOverlay}>
            <ScoreBubble score={item.score} size="md" />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{item.spotName}</Text>
          <Text style={styles.meta}>
            {item.category} · {item.location}
          </Text>
          <Text style={styles.review}>
            {item.review} <Text style={styles.more}>more</Text>
          </Text>
          <View style={styles.badges}>
            {item.characteristicIds.map((id) => (
              <CategoryBadge key={id} id={id} />
            ))}
          </View>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Users size={16} color={colors.ink} strokeWidth={2.2} />
              <Text style={styles.statText}>{item.hangs} hangs</Text>
            </View>
            <View style={styles.stat}>
              <Bookmark size={16} color={colors.ink} strokeWidth={2.2} />
              <Text style={styles.statText}>{item.saved} saves</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  if (item.kind === 'hang') {
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && pressedStyle]} onPress={openSpot}>
        <View style={styles.posterRow}>
          <Poster by={by} line={`${by.name} logged a hang at ${item.spotName}`} when={item.when} />
          <AccessSticker access={item.access} />
        </View>
        <Image
          source={{ uri: item.image }}
          style={styles.hangImage}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.body}>
          <Text style={styles.review}>{item.note}</Text>
          <View style={styles.hangFoot}>
            <View style={styles.stack}>
              {item.attendees.map((m, i) => (
                <View key={m.id} style={i === 0 ? undefined : styles.stacked}>
                  <Avatar label={m.initial} color={memberColor(m)} size={26} />
                </View>
              ))}
              {item.extraAttendees > 0 && (
                <View style={styles.stacked}>
                  <Avatar label={`+${item.extraAttendees}`} color="#555" size={26} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }} />
            <Heart size={16} color={colors.like} fill={colors.like} strokeWidth={2} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // ranked
  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.rankedCard, pressed && pressedStyle]}
      onPress={openSpot}
    >
      <View style={styles.rankedTop}>
        <Avatar label={by.initial} color={memberColor(by)} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={styles.posterLine}>{by.name} ranked a spot</Text>
          <Text style={styles.when}>{item.when}</Text>
        </View>
        <ScoreBubble score={item.score} size="md" />
      </View>
      <View style={styles.rankedInner}>
        <Image
          source={{ uri: item.thumb }}
          style={styles.rankedThumb}
          contentFit="cover"
          transition={150}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.rankedName}>{item.spotName}</Text>
          <Text style={styles.when}>
            moved to #{item.rank} · {item.category}
          </Text>
        </View>
        <AccessSticker access={item.access} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    marginBottom: 20,
    ...inkBorder,
    ...hardShadow(4),
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 11,
  },
  poster: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  posterLine: { fontFamily: font.bold, fontSize: 13, color: colors.ink },
  when: { fontFamily: font.semibold, fontSize: 11, color: colors.muted, marginTop: 2 },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    height: 208,
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderColor: colors.ink,
  },
  scoreOverlay: { position: 'absolute', right: 14, bottom: -20 },
  hangImage: { width: '100%', height: 200, borderBottomWidth: 2, borderColor: colors.ink },
  body: { padding: 16, paddingTop: 18 },
  name: { fontFamily: font.extrabold, fontSize: 21, letterSpacing: -0.3, color: colors.ink },
  meta: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 3 },
  review: {
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
    marginTop: 10,
  },
  more: { fontFamily: font.extrabold, color: colors.blue },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  actionText: { fontFamily: font.bold, fontSize: 13, color: colors.muted },
  hangFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  stack: { flexDirection: 'row' },
  stacked: { marginLeft: -8 },
  rankedCard: { padding: 14 },
  rankedTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.soft,
    borderRadius: radii.md,
    ...inkBorder,
    ...hardShadow(2),
  },
  rankedThumb: { width: 50, height: 50, borderRadius: 11, ...inkBorder },
  rankedName: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
});
