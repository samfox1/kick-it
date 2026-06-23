import { RotateCw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';

/** Shown when a load fails: a short message + a Try again button. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Couldn&apos;t load this</Text>
      {message ? (
        <Text style={styles.sub} numberOfLines={2}>
          {message}
        </Text>
      ) : null}
      <Pressable style={({ pressed }) => [styles.btn, pressed && pressedStyle]} onPress={onRetry}>
        <RotateCw size={16} color={colors.ink} strokeWidth={2.4} />
        <Text style={styles.btnText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 36, paddingTop: 48 },
  title: { fontFamily: font.extrabold, fontSize: 17, color: colors.ink, textAlign: 'center' },
  sub: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(3),
  },
  btnText: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
});
