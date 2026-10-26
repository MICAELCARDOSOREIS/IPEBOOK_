import { useCallback, useState } from "react";
import { localCacheUseCases } from "@/di/container";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";

export type SettingsState = {
  clearingCache: boolean;
  cacheCleared: boolean;
  cacheError: string | null;
};

export type SettingsActions = {
  clearBooksCache: () => Promise<void>;
};

const CLEAR_ERROR = "Não foi possível limpar os dados salvos. Tente novamente.";

/** Preferências do dispositivo da tela Configurações (Spec 073): limpeza do catálogo offline. */
export function useSettingsViewModel(
  useCases: ILocalCacheUseCases = localCacheUseCases,
): [SettingsState, SettingsActions] {
  const [state, setState] = useState<SettingsState>({
    clearingCache: false,
    cacheCleared: false,
    cacheError: null,
  });

  const clearBooksCache = useCallback(async () => {
    setState((previous) => ({ ...previous, clearingCache: true, cacheError: null }));
    try {
      await useCases.clearBooksCache();
      setState({ clearingCache: false, cacheCleared: true, cacheError: null });
    } catch {
      setState((previous) => ({ ...previous, clearingCache: false, cacheCleared: false, cacheError: CLEAR_ERROR }));
    }
  }, [useCases]);

  return [state, { clearBooksCache }];
}
