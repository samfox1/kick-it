import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { Member } from '@/domain/models';
import { accentRamp, colors, font, inkBorder } from '@/theme/tokens';

/** Deterministic accent color for a member. */
export function memberColor(member: Member): string {
  return accentRamp[member.id.charCodeAt(0) % accentRamp.length];
}

/** A round avatar: shows the member's photo when `uri` is set, else a colored initial. */
export function Avatar({
  label,
  color,
  size = 38,
  uri,
}: {
  label: string;
  color: string;
  size?: number;
  uri?: string;
}) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return (
      <Image source={{ uri }} style={[styles.av, shape]} contentFit="cover" transition={120} />
    );
  }
  return (
    <View style={[styles.av, shape, { backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  av: { alignItems: 'center', justifyContent: 'center', ...inkBorder, borderColor: colors.ink },
  text: { color: '#fff', fontFamily: font.extrabold },
});
