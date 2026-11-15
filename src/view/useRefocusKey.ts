import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

/**
 * Retorna um contador que só incrementa quando a tela volta a receber foco após a montagem inicial,
 * evitando recarregamento duplicado na abertura e permitindo atualizar dados ao retornar de telas filhas.
 */
export function useRefocusKey(): number {
  const [focusKey, setFocusKey] = useState(0);
  const hasFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      setFocusKey((key) => key + 1);
    }, []),
  );

  return focusKey;
}

/**
 * Executa `onRefocus` sempre que `focusKey` mudar para um valor positivo (> 0).
 */
export function useOnRefocus(focusKey: number | undefined, onRefocus: () => void): void {
  const lastFocusKey = useRef(focusKey ?? 0);

  useEffect(() => {
    const current = focusKey ?? 0;
    if (current <= 0 || current === lastFocusKey.current) return;
    lastFocusKey.current = current;
    onRefocus();
  }, [focusKey, onRefocus]);
}
