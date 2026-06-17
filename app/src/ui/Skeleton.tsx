import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, type DimensionValue } from 'react-native';

import { radii } from '@/theme/tokens';

/** A pulsing placeholder block, shown while real content loads. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = radii.sm,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const pulse = useMemo(() => new Animated.Value(0.4), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: radius, opacity: pulse }, style]}
    />
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: '#e9e9e6' },
});
