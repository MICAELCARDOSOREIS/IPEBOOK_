import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_SEARCH_FILTERS, SORT_IDS, type SearchFilters, type SearchSortOption } from "@/viewmodel/searchFilters";

export const SEARCH_FILTERS_STORAGE_KEY = "@ipebook:search_filters";

export type PersistedSearchFilters = Readonly<{
  filters: SearchFilters;
  sortBy: SearchSortOption;
}>;

export type UsePersistedSearchFiltersResult = {
  /** Filtros carregados do storage; `null` se não houver dados gravados ou a leitura ainda não terminou. */
  persisted: PersistedSearchFilters | null;
  /** `true` após a primeira leitura concluir (com ou sem dados). */
  loaded: boolean;
  /** Grava filtros e ordenação no storage de forma assíncrona e silenciosa. */
  persist: (filters: SearchFilters, sortBy: SearchSortOption) => void;
};

/**
 * Persiste os filtros aplicados e a ordenação do Explorar entre sessões.
 * Segue o mesmo padrão de `useActiveNeighborhood`: carrega na montagem, grava sob demanda.
 */
export function usePersistedSearchFilters(): UsePersistedSearchFiltersResult {
  const [persisted, setPersisted] = useState<PersistedSearchFilters | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStored() {
      try {
        const stored = await AsyncStorage.getItem(SEARCH_FILTERS_STORAGE_KEY);
        if (isMounted && stored) {
          const parsed = JSON.parse(stored) as Partial<PersistedSearchFilters>;
          const rawSort = parsed.sortBy;
          const validSort =
            rawSort && SORT_IDS.includes(rawSort) ? rawSort : "recent";
          setPersisted({
            filters: { ...DEFAULT_SEARCH_FILTERS, ...(parsed.filters ?? {}) },
            sortBy: validSort,
          });
        }
      } catch {
        // Fallback silencioso em caso de falha de leitura
      }
      if (isMounted) setLoaded(true);
    }
    void loadStored();
    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback((filters: SearchFilters, sortBy: SearchSortOption) => {
    void AsyncStorage.setItem(
      SEARCH_FILTERS_STORAGE_KEY,
      JSON.stringify({ filters, sortBy }),
    ).catch(() => {
      // Ignora erro de gravação não crítico
    });
  }, []);

  return { persisted, loaded, persist };
}
