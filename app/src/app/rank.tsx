import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { insertIndex, nextComparisonIndex, scoreForInsert } from '@/domain/rankInsert';
import { sortByScoreDesc } from '@/domain/ranking';
import { haptics } from '@/lib/haptics';
import { useSpotsStore } from '@/store/spotsStore';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';
import { ComparisonStack } from '@/ui/ComparisonStack';
import { PopIn } from '@/ui/PopIn';
import { ScoreBubble } from '@/ui/ScoreBubble';

type Answer = 'better' | 'worse';

export default function RankScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { local, mine, saved, rankSpot } = useSpotsStore();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [committed, setCommitted] = useState(false);

  const spot = [...mine, ...local, ...saved].find((s) => s.id === spotId);

  // Compare against your already-ranked spots, excluding this one (so re-ranking works).
  const ranked = sortByScoreDesc(mine.filter((s) => s.id !== spotId));
  const compareIdx = nextComparisonIndex(ranked.length, answers);
  const done = compareIdx === -1;
  const finalIndex = insertIndex(ranked.length, answers);
  const finalScore = scoreForInsert(
    ranked.map((s) => s.score),
    finalIndex,
  );

  // Persist the result once the comparisons resolve.
  useEffect(() => {
    if (done && spot && !committed) {
      rankSpot(spot, finalScore);
      haptics.success();
      setCommitted(true);
    }
  }, [done, spot, committed, rankSpot, finalScore]);

  const answer = (a: Answer) => {
    haptics.tick();
    setAnswers((prev) => [...prev, a]);
  };

  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Spot not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.x, pressed && pressedStyle]}
          onPress={() => router.back()}
        >
          <X size={18} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Rank it</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        {!done && (
          <Text style={styles.sub}>
            A couple quick taps set the score. No stars, no overthinking.
          </Text>
        )}
        <ComparisonStack
          subjectName={spot.name}
          ranked={ranked}
          answers={answers}
          onAnswer={answer}
        />

        {done && (
          <View style={styles.reveal}>
            <PopIn>
              <ScoreBubble score={finalScore} size="lg" />
            </PopIn>
            <Text style={styles.revealName}>{spot.name}</Text>
            <Text style={styles.revealSub}>Lands at #{finalIndex + 1} on your ranked list</Text>
            <Pressable
              style={({ pressed }) => [styles.doneBtn, pressed && pressedStyle]}
              onPress={() => router.back()}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  notFound: { fontFamily: font.bold, color: colors.muted },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 10 },
  x: {
    width: 36,
    height: 36,
    borderRadius: 11,
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
  body: { paddingHorizontal: 18, paddingTop: 30 },
  sub: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    marginBottom: 22,
  },
  reveal: { alignItems: 'center', marginTop: 40, paddingHorizontal: 18 },
  revealName: { fontFamily: font.extrabold, fontSize: 24, color: colors.ink, marginTop: 14 },
  revealSub: { fontFamily: font.semibold, fontSize: 13, color: colors.muted, marginTop: 4 },
  doneBtn: {
    marginTop: 24,
    backgroundColor: colors.blue,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: radii.md,
    ...inkBorder,
    ...hardShadow(4),
  },
  doneText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
});
