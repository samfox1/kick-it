import { StyleSheet, Text, View } from 'react-native';

import { scoreColor } from '@/domain/score';
import { font, hardShadow, inkBorder } from '@/theme/tokens';

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { box: number; text: number; tail: number }> = {
  sm: { box: 40, text: 14, tail: 7 },
  md: { box: 48, text: 17, tail: 8 },
  lg: { box: 56, text: 20, tail: 8 },
};

/** The signature score bubble: a speech-bubble shape filled by score color (10=green … 0=red). */
export function ScoreBubble({ score, size = 'md' }: { score: number; size?: Size }) {
  const s = SIZES[size];
  return (
    <View
      accessibilityLabel={`Score ${score}`}
      style={[
        styles.bubble,
        {
          width: s.box,
          height: s.box,
          borderBottomLeftRadius: s.tail,
          borderTopLeftRadius: s.box / 2,
          borderTopRightRadius: s.box / 2,
          borderBottomRightRadius: s.box / 2,
          backgroundColor: scoreColor(score),
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: s.text }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { alignItems: 'center', justifyContent: 'center', ...inkBorder, ...hardShadow(2) },
  text: { color: '#fff', fontFamily: font.extrabold },
});
