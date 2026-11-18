import { Platform } from "react-native";

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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Haptics = require("expo-haptics");
    switch (type) {
      case "light":
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light ?? "light");
        break;
      case "medium":
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Medium ?? "medium");
        break;
      case "heavy":
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Heavy ?? "heavy");
        break;
      case "selection":
        Haptics.selectionAsync?.();
        break;
      case "success":
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success ?? "success");
        break;
      case "warning":
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning ?? "warning");
        break;
      case "error":
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Error ?? "error");
        break;
    }
  } catch {
    // Fallback gracioso em ambientes onde expo-haptics não está linkado ou durante testes
  }
}
