import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';

/** A friendly empty state: a hand-drawn doodle over a short message. */
export function EmptyState({
  source,
  title,
  subtitle,
}: {
  source: ImageSource;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <Image source={source} style={styles.img} contentFit="contain" />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 36, paddingTop: 48 },
  img: { width: 150, height: 110, opacity: 0.9, marginBottom: 14 },
  title: { fontFamily: font.extrabold, fontSize: 17, color: colors.ink, textAlign: 'center' },
  sub: {
    fontFamily: font.semibold,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
