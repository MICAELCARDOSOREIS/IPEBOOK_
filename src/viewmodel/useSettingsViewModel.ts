import { useCallback, useState } from "react";
import { localCacheUseCases, searchHistoryUseCases } from "@/di/container";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";

export type SettingsState = {
  clearingCache: boolean;
  cacheCleared: boolean;
  cacheError: string | null;
  clearingHistory: boolean;
  historyCleared: boolean;
  historyError: string | null;
};

export type SettingsActions = {
  clearBooksCache: () => Promise<void>;
  /** Apaga os termos buscados recentemente neste aparelho (Spec 091). */
  clearSearchHistory: (sessionUserId: string | null) => Promise<void>;
};

const CLEAR_ERROR = "Não foi possível limpar os dados salvos. Tente novamente.";
const HISTORY_ERROR = "Não foi possível limpar o histórico de buscas. Tente novamente.";

/** Preferências do dispositivo da tela Configurações (Spec 073): limpeza do catálogo offline. */
export function useSettingsViewModel(
  useCases: ILocalCacheUseCases = localCacheUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [SettingsState, SettingsActions] {
  const [state, setState] = useState<SettingsState>({
    clearingCache: false,
    cacheCleared: false,
    cacheError: null,
    clearingHistory: false,
    historyCleared: false,
    historyError: null,
  });

  const clearBooksCache = useCallback(async () => {
    setState((previous) => ({ ...previous, clearingCache: true, cacheError: null }));
    try {
      await useCases.clearBooksCache();
      setState((previous) => ({ ...previous, clearingCache: false, cacheCleared: true, cacheError: null }));
    } catch {
      setState((previous) => ({ ...previous, clearingCache: false, cacheCleared: false, cacheError: CLEAR_ERROR }));
    }
  }, [useCases]);

  const clearSearchHistory = useCallback(
    async (sessionUserId: string | null) => {
      setState((previous) => ({ ...previous, clearingHistory: true, historyError: null }));
      try {
        await history.clearHistory(sessionUserId);
        setState((previous) => ({ ...previous, clearingHistory: false, historyCleared: true }));
      } catch {
        setState((previous) => ({ ...previous, clearingHistory: false, historyCleared: false, historyError: HISTORY_ERROR }));
      }
    },
    [history],
  );

  return [state, { clearBooksCache, clearSearchHistory }];
}
