import { StyleSheet, Text, View } from 'react-native';

import type { AccessLevel } from '@/domain/models';
import { colors, font, hardShadow, inkBorder } from '@/theme/tokens';

const LABEL: Record<AccessLevel, string> = {
  open: 'Open to all',
  friends: 'Friends only',
  invite: 'Invite only',
};

/** A rotated "sticker" tag for a spot's access level. */
export function AccessSticker({ access }: { access: AccessLevel }) {
  return (
    <View style={styles.sticker}>
      <Text style={styles.text}>{LABEL[access]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    alignSelf: 'flex-start',
    backgroundColor: colors.paper,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    transform: [{ rotate: '-6deg' }],
    ...inkBorder,
    ...hardShadow(2),
  },
  text: {
    fontFamily: font.extrabold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
