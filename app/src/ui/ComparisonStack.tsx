import { Check, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { nextComparisonIndex } from '@/domain/rankInsert';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';

type Answer = 'better' | 'worse';
type Rankable = { name: string; score: number };

/**
 * The pairwise ranking experience: each comparison you finish drops into a colored history
 * (your pick green, the other red), and the next comparison appears below it.
 */
export function ComparisonStack({
  subjectName,
  ranked,
  answers,
  onAnswer,
}: {
  subjectName: string;
  ranked: Rankable[];
  answers: Answer[];
  onAnswer: (a: Answer) => void;
}) {
  const activeIdx = nextComparisonIndex(ranked.length, answers);
  const done = activeIdx === -1;

  const Pill = ({ label, won }: { label: string; won: boolean }) => (
    <View style={[styles.pill, won ? styles.win : styles.lose]}>
      {won ? (
        <Check size={13} color="#15803d" strokeWidth={2.8} />
      ) : (
        <X size={13} color={colors.like} strokeWidth={2.8} />
      )}
      <Text style={[styles.pillText, { color: won ? '#15803d' : colors.like }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <View>
      {answers.map((a, k) => {
        const other = ranked[nextComparisonIndex(ranked.length, answers.slice(0, k))];
        const subjectWon = a === 'better';
        return (
          <View key={k} style={styles.doneRow}>
            <Pill label={subjectName} won={subjectWon} />
            <Text style={styles.vsSmall}>vs</Text>
            <Pill label={other?.name ?? ''} won={!subjectWon} />
          </View>
        );
      })}

      {!done && (
        <View style={styles.active}>
          <Text style={styles.q}>Which did you like better?</Text>
          <View style={styles.vs}>
            <Pressable
              style={({ pressed }) => [styles.vsCard, pressed && pressedStyle]}
              onPress={() => onAnswer('better')}
            >
              <Text style={styles.vsName}>{subjectName}</Text>
              <Text style={styles.vsSub}>this spot</Text>
            </Pressable>
            <Text style={styles.vsMid}>vs</Text>
            <Pressable
              style={({ pressed }) => [styles.vsCard, pressed && pressedStyle]}
              onPress={() => onAnswer('worse')}
            >
              <Text style={styles.vsName}>{ranked[activeIdx]?.name}</Text>
              <Text style={styles.vsSub}>{ranked[activeIdx]?.score} on your list</Text>
            </Pressable>
          </View>
          <Text style={styles.cmpHint}>Comparison {answers.length + 1}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: radii.md,
    ...inkBorder,
  },
  win: { backgroundColor: '#e4f7ea' },
  lose: { backgroundColor: '#fde8e8' },
  pillText: { flex: 1, fontFamily: font.bold, fontSize: 12.5 },
  vsSmall: { fontFamily: font.extrabold, fontSize: 11, color: colors.muted2 },
  active: { marginTop: 6 },
  q: { fontFamily: font.extrabold, fontSize: 20, letterSpacing: -0.4, color: colors.ink },
  vs: { flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: 14 },
  vsCard: {
    flex: 1,
    padding: 16,
    minHeight: 104,
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(4),
  },
  vsName: { fontFamily: font.extrabold, fontSize: 16, letterSpacing: -0.2, color: colors.ink },
  vsSub: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 4 },
  vsMid: { alignSelf: 'center', fontFamily: font.extrabold, color: colors.muted },
  cmpHint: {
    textAlign: 'center',
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 16,
  },
});
