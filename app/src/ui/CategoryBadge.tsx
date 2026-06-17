import { createElement } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getCharacteristic } from '@/domain/characteristics';
import { categoryColors, colors, font, hardShadow, inkBorder } from '@/theme/tokens';
import { characteristicIcon } from '@/ui/characteristicIcon';

/**
 * A characteristic chip, colored by its category. Optionally shows an endorse count
 * and becomes tappable; when `endorsed` it fills solid (you've vouched for it).
 */
export function CategoryBadge({
  id,
  count,
  endorsed = false,
  onPress,
  width,
}: {
  id: string;
  count?: number;
  endorsed?: boolean;
  onPress?: () => void;
  /** Explicit cell width. When omitted, the badge sizes to ~5 per row of the screen. */
  width?: number;
}) {
  const { width: winWidth } = useWindowDimensions();
  // Size the badge to fill exactly 5 per row across the content width, so there's no
  // dead space on the right. Bigger screens (Pro Max) get proportionally bigger badges.
  // A caller (e.g. a narrower panel) can override with an explicit `width`.
  const COLS = 5;
  const CONTENT_PAD = 36; // 18px on each side of the screens that stack many badges
  const COL_GAP = 7;
  const cell =
    width ??
    Math.min(96, Math.max(58, Math.floor((winWidth - CONTENT_PAD - COL_GAP * (COLS - 1)) / COLS)));
  const circle = cell - 12;
  const iconSize = Math.round(circle * 0.46);

  const ch = getCharacteristic(id);
  if (!ch) return null;
  const c = categoryColors[ch.category];
  const iconColor = endorsed ? '#fff' : c.fg;
  const circleBg = endorsed ? c.fg : c.bg;

  const inner = (
    <>
      <View style={{ width: circle, height: circle, position: 'relative' }}>
        <View
          style={[
            styles.circle,
            { width: circle, height: circle, borderRadius: circle / 2, backgroundColor: circleBg },
          ]}
        >
          {createElement(characteristicIcon(id), {
            size: iconSize,
            color: iconColor,
            strokeWidth: 2.2,
          })}
        </View>
        {count !== undefined && (
          <View style={styles.countBubble}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, { color: c.fg }]} numberOfLines={2}>
        {ch.label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: endorsed }}
        onPress={onPress}
        style={[styles.badge, { width: cell }]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.badge, { width: cell }]}>{inner}</View>;
}

const styles = StyleSheet.create({
  // paddingTop gives the count bubble (which sits above the circle) room so it isn't clipped.
  badge: { alignItems: 'center', paddingTop: 8 },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    ...inkBorder,
    ...hardShadow(2),
  },
  countBubble: {
    position: 'absolute',
    top: -7,
    right: -7,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
    ...inkBorder,
  },
  countText: { fontFamily: font.extrabold, fontSize: 10, color: '#fff' },
  label: { fontFamily: font.bold, fontSize: 10, marginTop: 6, textAlign: 'center' },
});
