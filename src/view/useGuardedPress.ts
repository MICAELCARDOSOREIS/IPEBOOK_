import { useCallback, useRef } from "react";

/** Intervalo em que um segundo toque no mesmo botão é tratado como duplo toque. */
const DOUBLE_TAP_WINDOW_MS = 600;

/** Nos testes de tela os toques sequenciais são legítimos e quase simultâneos; a janela só vale no app. */
const DEFAULT_WINDOW_MS = process.env.NODE_ENV === "test" ? 0 : DOUBLE_TAP_WINDOW_MS;

/**
 * Embrulha um `onPress` para ignorar o toque repetido logo em seguida: duplo toque disparava a ação
 * duas vezes (tela aberta em dobro, envio repetido) antes de o estado de carregamento aparecer.
 */
export function useGuardedPress<Args extends unknown[]>(
  onPress: ((...args: Args) => void) | undefined,
  windowMs: number = DEFAULT_WINDOW_MS,
) {
  const lastAt = useRef(0);
  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (windowMs > 0 && now - lastAt.current < windowMs) return;
      lastAt.current = now;
      onPress?.(...args);
    },
    [onPress, windowMs],
  );
}
