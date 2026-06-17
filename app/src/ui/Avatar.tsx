import { StyleSheet, Text, View } from 'react-native';

import type { Member } from '@/domain/models';
import { accentRamp, colors, font, inkBorder } from '@/theme/tokens';

/** Deterministic accent color for a member. */
export function memberColor(member: Member): string {
  return accentRamp[member.id.charCodeAt(0) % accentRamp.length];
}

/** A round initial avatar. */
export function Avatar({
  label,
  color,
  size = 38,
}: {
  label: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.av,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  av: { alignItems: 'center', justifyContent: 'center', ...inkBorder, borderColor: colors.ink },
  text: { color: '#fff', fontFamily: font.extrabold },
});
