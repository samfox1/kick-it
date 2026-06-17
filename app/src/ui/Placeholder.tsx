import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';

/** Temporary stub for screens not yet built in this slice. */
export function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    gap: 6,
  },
  title: { fontFamily: font.extrabold, fontSize: 26, color: colors.ink },
  sub: { fontFamily: font.semibold, fontSize: 14, color: colors.muted },
});
