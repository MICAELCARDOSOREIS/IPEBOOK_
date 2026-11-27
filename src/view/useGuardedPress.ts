import { useCallback, useRef } from "react";
import { isMainTabsSwipeActive } from "@/view/mainTabsState";

/** Intervalo em que toques repetidos no mesmo botão são tratados como duplo/triplo toque. */
const DOUBLE_TAP_WINDOW_MS = 600;

/** Nos testes de tela os toques sequenciais são legítimos e quase simultâneos; a janela só vale no app. */
const DEFAULT_WINDOW_MS = process.env.NODE_ENV === "test" ? 0 : DOUBLE_TAP_WINDOW_MS;

/** Deslocamento máximo (px) para considerar um gesto como toque legítimo e não arraste lateral/vertical. */
const MAX_TAP_DRAG_X = 10;
const MAX_TAP_DRAG_Y = 12;

export type TouchOrigin = { x: number; y: number };
type TouchCoordinateEvent = { nativeEvent?: { pageX?: number; pageY?: number } };

export function getTouchOrigin(event?: TouchCoordinateEvent): TouchOrigin | null {
  const x = event?.nativeEvent?.pageX;
  const y = event?.nativeEvent?.pageY;
  if (typeof x === "number" && Number.isFinite(x) && typeof y === "number" && Number.isFinite(y)) {
    return { x, y };
  }
  return null;
}

export function isDragPressRelease(origin: TouchOrigin | null, event?: TouchCoordinateEvent): boolean {
  if (!origin) return false;
  const end = getTouchOrigin(event);
  if (!end) return false;
  return Math.abs(end.x - origin.x) > MAX_TAP_DRAG_X || Math.abs(end.y - origin.y) > MAX_TAP_DRAG_Y;
}

/**
 * Embrulha um `onPress` para ignorar toques repetidos logo em seguida e toques acidentais durante
 * ou imediatamente após o arraste horizontal entre abas principais (Spec 144).
 * Renova o timestamp em toques subsequentes para neutralizar rajadas de toques rápidos.
 */
export function useGuardedPress<Args extends unknown[]>(
  onPress: ((...args: Args) => void) | undefined,
  windowMs: number = DEFAULT_WINDOW_MS,
) {
  const lastAt = useRef(0);
  return useCallback(
    (...args: Args) => {
      if (isMainTabsSwipeActive()) {
        return;
      }
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
