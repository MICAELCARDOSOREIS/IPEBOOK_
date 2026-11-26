import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

/**
 * Executa `onForeground` sempre que o aplicativo volta do segundo plano para ativo (mobile)
 * ou quando a aba do navegador volta a ficar visível (web), garantindo ressincronização
 * após quedas silenciosas de WebSocket em redes móveis.
 */
export function useAppForegroundRefresh(onForeground: () => void, enabled = true): void {
  const callbackRef = useRef(onForeground);
  callbackRef.current = onForeground;

  useEffect(() => {
    if (!enabled) return;

    let lastState: string = AppState.currentState ?? "active";
    const appStateSub = AppState.addEventListener?.("change", (nextState: AppStateStatus) => {
      const returnedToActive = lastState !== "active" && nextState === "active";
      lastState = nextState;
      if (returnedToActive) {
        callbackRef.current();
      }
    });

    let removeWebListeners: (() => void) | undefined;
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          callbackRef.current();
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      removeWebListeners = () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }

    return () => {
      appStateSub?.remove?.();
      removeWebListeners?.();
    };
  }, [enabled]);
}

/**
 * Agrupa rajadas de eventos em tempo real (ex.: atualização em `v2_meetings` + `v2_notifications`)
 * em um único recarregamento silencioso. Em ambiente de teste dispara imediatamente para manter
 * a previsibilidade síncrona das asserções.
 */
export function useDebouncedRealtimeCallback(callback: () => void, delayMs = 150): () => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTest = process.env.NODE_ENV === "test";

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return useCallback(() => {
    if (isTest || delayMs <= 0) {
      callbackRef.current();
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      callbackRef.current();
    }, delayMs);
  }, [delayMs, isTest]);
}
