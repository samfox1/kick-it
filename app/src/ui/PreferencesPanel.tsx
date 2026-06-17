import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/theme/tokens';
import { CategoryBadge } from '@/ui/CategoryBadge';

const GAP = 7;
const MIN_CELL = 64;

/**
 * Shared spot-filter controls: a distance slider ("Within X mi") and selectable
 * non-negotiable badges that evenly fill the available width (4 per row on a phone,
 * more on bigger screens). Used by both the Spots preferences dropdown and the Explore
 * filters overlay so they stay consistent.
 *
 * Badges size to the badge row's *measured* width, so they fill it exactly. They render a
 * frame after layout (not resized) to avoid a measure-then-grow flash.
 */
export function PreferencesPanel({
  maxMi,
  onMaxDistance,
  minMi = 1,
  maxLimit = 50,
  step = 1,
  showDistance = true,
  ids,
  selected,
  onToggle,
}: {
  maxMi: number;
  onMaxDistance: (mi: number) => void;
  minMi?: number;
  maxLimit?: number;
  step?: number;
  /** Hide the distance slider where distance isn't applied (e.g. Crew / My spots). */
  showDistance?: boolean;
  ids: string[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [rowW, setRowW] = useState(0);
  const cols = Math.max(4, Math.floor((rowW + GAP) / (MIN_CELL + GAP)));
  const cell = Math.floor((rowW - GAP * (cols - 1)) / cols);

  // Drive the slider from local state so its mount-time onValueChange can't
  // overwrite the stored value (the panel remounts each time it's opened).
  // The live value updates the label as you drag; we commit on release.
  // Only accept value changes while actually dragging — the slider emits a
  // spurious onValueChange (at the minimum) on mount, which would otherwise
  // snap the label/thumb to far-left.
  const [mi, setMi] = useState(maxMi);
  const sliding = useRef(false);
  useEffect(() => setMi(maxMi), [maxMi]);

  // The slider starts with an internal width of 0 and only learns its real
  // width on layout — until then the thumb sits at the far left, which reads as
  // a snap. Keep it hidden until it has been laid out, then reveal a frame
  // later (once the thumb has been positioned for the real width).
  const [ready, setReady] = useState(false);
  const revealAfterLayout = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };

  return (
    <>
      {showDistance && (
        <>
          <Text style={styles.h}>
            Within <Text style={styles.hAccent}>{mi} mi</Text>
          </Text>
          <View onLayout={revealAfterLayout} style={{ opacity: ready ? 1 : 0 }}>
            <Slider
              minimumValue={minMi}
              maximumValue={maxLimit}
              step={step}
              value={mi}
              onSlidingStart={() => {
                sliding.current = true;
              }}
              onValueChange={(v) => {
                if (sliding.current) setMi(v);
              }}
              onSlidingComplete={(v) => {
                sliding.current = false;
                setMi(v);
                onMaxDistance(v);
              }}
              minimumTrackTintColor={colors.blue}
              maximumTrackTintColor="#d8d8d8"
              thumbTintColor={colors.blue}
            />
          </View>
          <Text style={styles.note}>How far you&apos;ll travel to kick it.</Text>
        </>
      )}

      <Text style={[styles.h, showDistance ? { marginTop: 16 } : undefined]}>
        Non-negotiables — only show spots that have:
      </Text>
      <View style={styles.badges} onLayout={(e) => setRowW(e.nativeEvent.layout.width)}>
        {rowW > 0 &&
          ids.map((id) => (
            <CategoryBadge
              key={id}
              id={id}
              width={cell}
              endorsed={selected.includes(id)}
              onPress={() => onToggle(id)}
            />
          ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  h: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  hAccent: { color: colors.blue },
  note: { fontFamily: font.semibold, fontSize: 12, color: colors.muted, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: 12, marginTop: 10 },
});
