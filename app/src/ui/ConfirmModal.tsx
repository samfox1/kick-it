import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, hardShadow, inkBorder, pressedStyle, radii } from '@/theme/tokens';

/**
 * In-app confirmation dialog matching the Kick It look (ink border, hard shadow).
 * Replaces the platform `Alert.alert` so destructive prompts feel native to the app.
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable testID="confirmBackdrop" style={styles.backdrop} onPress={onCancel}>
        {/* Absorbs presses so tapping the card itself doesn't dismiss via the backdrop. */}
        <Pressable testID="confirmCard" style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btn, styles.cancel, pressed && pressedStyle]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.confirmDestructive : styles.confirm,
                pressed && pressedStyle,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: 22,
    ...inkBorder,
    ...hardShadow(5),
  },
  title: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  message: {
    fontFamily: font.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
    marginTop: 8,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    ...inkBorder,
  },
  cancel: { backgroundColor: colors.paper },
  cancelText: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  confirm: { backgroundColor: colors.blue },
  confirmDestructive: { backgroundColor: colors.like },
  confirmText: { fontFamily: font.bold, fontSize: 15, color: colors.paper },
});
