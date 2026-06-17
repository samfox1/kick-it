import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, hardShadow, inkBorder, radii } from '@/theme/tokens';

export interface SegOption<T extends string> {
  value: T;
  label: string;
}

/** Pill segmented control (Local / My spots, etc.). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.soft,
    borderRadius: radii.md,
    padding: 4,
    ...inkBorder,
  },
  btn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  btnActive: {
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.ink,
    ...hardShadow(2),
  },
  label: { fontFamily: font.bold, fontSize: 13.5, color: colors.muted },
  labelActive: { color: colors.ink },
});
