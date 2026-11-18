import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * Retorna se o usuário ativou "Reduzir Transparência" nas opções de acessibilidade (Apple HIG / Spec 137).
 * No iOS, superfícies Liquid Glass devem retornar a fundo sólido quando este recurso estiver ativado.
 */
export function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (Platform.OS === "ios" && typeof AccessibilityInfo?.isReduceTransparencyEnabled === "function") {
      AccessibilityInfo.isReduceTransparencyEnabled()
        .then((enabled) => {
          if (mounted) setReduceTransparency(Boolean(enabled));
        })
        .catch(() => {});

      const sub = AccessibilityInfo.addEventListener?.(
        "reduceTransparencyChanged",
        (enabled: boolean) => {
          if (mounted) setReduceTransparency(Boolean(enabled));
        },
      );

      return () => {
        mounted = false;
        sub?.remove?.();
      };
    }
    return () => {
      mounted = false;
    };
  }, []);

  return reduceTransparency;
}
