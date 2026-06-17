import * as Haptics from 'expo-haptics';

/** Tiny semantic wrappers around expo-haptics so call sites read clearly. Fire-and-forget. */
export const haptics = {
  /** A light tick — selection / pass. */
  tick: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  /** A medium bump — a like or a deliberate action. */
  bump: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  /** A success buzz — something was saved/created. */
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};
