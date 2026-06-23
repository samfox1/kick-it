import { Image } from 'expo-image';
import { Shuffle } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import {
  AVATAR_BACKGROUNDS,
  buildAvatarUrl,
  randomSeed,
  type AvatarOptions,
} from '@/domain/avatar';
import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';

/**
 * Build-your-avatar sheet: shuffle the features, toggle glasses/beard, pick a background.
 * On save, returns the finished DiceBear URL. Stays on-brand (notionists) so everyone matches.
 */
export function AvatarCustomizer({
  visible,
  initialSeed,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialSeed: string;
  onSave: (url: string) => void;
  onClose: () => void;
}) {
  const [opts, setOpts] = useState<AvatarOptions>({
    seed: initialSeed,
    glasses: false,
    beard: false,
    background: AVATAR_BACKGROUNDS[0],
  });

  const set = (patch: Partial<AvatarOptions>) => setOpts((o) => ({ ...o, ...patch }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Build your avatar</Text>

          <View style={[styles.previewWrap, { backgroundColor: `#${opts.background}` }]}>
            <Image source={{ uri: buildAvatarUrl(opts) }} style={styles.preview} transition={120} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.shuffle, pressed && pressedStyle]}
            onPress={() => set({ seed: randomSeed() })}
          >
            <Shuffle size={16} color={colors.ink} strokeWidth={2.4} />
            <Text style={styles.shuffleText}>Shuffle</Text>
          </Pressable>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Glasses</Text>
            <Switch
              value={opts.glasses}
              onValueChange={(v) => set({ glasses: v })}
              trackColor={{ true: colors.blue, false: '#d4d4d4' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Beard</Text>
            <Switch
              value={opts.beard}
              onValueChange={(v) => set({ beard: v })}
              trackColor={{ true: colors.blue, false: '#d4d4d4' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.swatchLabel}>Background</Text>
          <View style={styles.swatches}>
            {AVATAR_BACKGROUNDS.map((bg) => (
              <Pressable
                key={bg}
                onPress={() => set({ background: bg })}
                style={[
                  styles.swatch,
                  { backgroundColor: `#${bg}` },
                  opts.background === bg && styles.swatchOn,
                ]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancel, pressed && pressedStyle]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.save, pressed && pressedStyle]}
              onPress={() => onSave(buildAvatarUrl(opts))}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,17,17,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 22,
    paddingBottom: 36,
    ...inkBorder,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.soft,
    alignSelf: 'center',
  },
  title: { fontFamily: font.extrabold, fontSize: 19, color: colors.ink, marginTop: 14 },
  previewWrap: {
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: radii.lg,
    padding: 8,
    ...inkBorder,
    ...hardShadow(3),
  },
  preview: { width: 120, height: 120, borderRadius: radii.md },
  shuffle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 7,
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    ...inkBorder,
    ...hardShadow(2),
  },
  shuffleText: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  toggleLabel: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  swatchLabel: { fontFamily: font.bold, fontSize: 15, color: colors.ink, marginTop: 18 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  swatch: { width: 38, height: 38, borderRadius: 19, ...inkBorder },
  swatchOn: { borderColor: colors.blue, borderWidth: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: radii.md, alignItems: 'center', ...inkBorder },
  cancel: { backgroundColor: colors.paper },
  cancelText: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  save: { backgroundColor: colors.blue },
  saveText: { fontFamily: font.extrabold, fontSize: 15, color: '#fff' },
});
