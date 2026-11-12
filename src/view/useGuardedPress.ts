import { useCallback, useRef } from "react";

/** Intervalo em que toques repetidos no mesmo botão são tratados como duplo/triplo toque. */
const DOUBLE_TAP_WINDOW_MS = 600;

/** Nos testes de tela os toques sequenciais são legítimos e quase simultâneos; a janela só vale no app. */
const DEFAULT_WINDOW_MS = process.env.NODE_ENV === "test" ? 0 : DOUBLE_TAP_WINDOW_MS;

/**
 * Embrulha um `onPress` para ignorar toques repetidos logo em seguida: duplo ou triplo toque disparava
 * a ação múltiplas vezes (tela aberta em dobro, envio repetido) antes de o estado de carregamento aparecer.
 * Renova o timestamp em toques subsequentes para neutralizar rajadas de toques rápidos.
 */
export function useGuardedPress<Args extends unknown[]>(
  onPress: ((...args: Args) => void) | undefined,
  windowMs: number = DEFAULT_WINDOW_MS,
) {
  const lastAt = useRef(0);
  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (windowMs > 0 && now - lastAt.current < windowMs) {
        lastAt.current = now;
        return;
      }
      lastAt.current = now;
      onPress?.(...args);
    },
    [onPress, windowMs],
  );
}
