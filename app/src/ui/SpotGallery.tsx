import { Image } from 'expo-image';
import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * A full-width, swipeable photo carousel for a spot. Pages horizontally with
 * snap, and shows page dots when there's more than one photo.
 */
export function SpotGallery({ images, height = 300 }: { images: string[]; height?: number }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const multiple = images.length > 1;

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ height }}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={multiple}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
      >
        {images.map((uri, i) => (
          <Image
            key={`${i}-${uri}`}
            testID="spotGalleryPhoto"
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={150}
          />
        ))}
      </ScrollView>

      {multiple && (
        <View style={styles.dots} testID="spotGalleryDots" pointerEvents="none">
          {images.map((uri, i) => (
            <View key={`${i}-${uri}`} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  dotOn: { backgroundColor: colors.paper, width: 18 },
});
