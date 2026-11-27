import { useEffect, useRef, type ComponentRef } from "react";
import { AccessibilityInfo, Platform, type Text } from "react-native";

/**
 * Anuncia para leitores de tela (TalkBack/VoiceOver/NVDA) quando uma mensagem de erro de
 * submissão aparece, e move o foco até ela — para que a pessoa não precise navegar às cegas
 * até encontrar o motivo da falha após submeter um formulário inválido (Spec 042 / Issue #147).
 */
export function useFormErrorAnnouncer(error: string | null | undefined) {
  const ref = useRef<ComponentRef<typeof Text>>(null);
  const previousError = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== previousError.current) {
      const node = ref.current;
      if (Platform.OS === "ios" && node && AccessibilityInfo.sendAccessibilityEvent) {
        AccessibilityInfo.sendAccessibilityEvent(node, "focus");
      } else {
        AccessibilityInfo.announceForAccessibility(error);
        node?.focus?.();
      }
    }
    previousError.current = error ?? null;
  }, [error]);

  return ref;
}
