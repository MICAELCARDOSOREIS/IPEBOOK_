import { useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Anuncia para leitores de tela (TalkBack/VoiceOver/NVDA) quando uma mensagem de erro de
 * submissão aparece, e move o foco até ela — para que a pessoa não precise navegar às cegas
 * até encontrar o motivo da falha após submeter um formulário inválido (Spec 042 / Issue #147).
 */
export function useFormErrorAnnouncer(error: string | null | undefined) {
  const ref = useRef<any>(null);
  const previousError = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== previousError.current) {
      AccessibilityInfo.announceForAccessibility(error);
      const node = ref.current;
      if (node && typeof node.focus === "function") {
        node.focus();
      }
    }
    previousError.current = error ?? null;
  }, [error]);

  return ref;
}
