import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type HapticFeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

/**
 * Utilitário de feedback tátil para Apple HIG (Spec 137).
 * Atua de forma segura e não bloqueante; caso o módulo nativo não esteja presente, falha silenciosamente (no-op).
 */
export function triggerHaptic(type: HapticFeedbackType = "light"): void {
  if (Platform.OS !== "ios") return;
  try {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "selection":
        Haptics.selectionAsync();
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Fallback gracioso em ambientes onde expo-haptics não está linkado ou durante testes
  }
}
