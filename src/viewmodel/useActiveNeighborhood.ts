import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSessionMemoryCache } from "@/viewmodel/sessionCacheRegistry";

export const ACTIVE_NEIGHBORHOOD_STORAGE_KEY = "@ipebook:active_neighborhood";

export type ActiveNeighborhoodHookResult = {
  activeNeighborhood: string;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  selectNeighborhood: (neighborhood: string) => Promise<void>;
};

let memoryActiveNeighborhood: string | null = null;

registerSessionMemoryCache(() => {
  memoryActiveNeighborhood = null;
});

/**
 * Hook para gerenciar e persistir o bairro ativo do leitor em Piripiri, PI (Spec 067 / ADR 0050).
 * Persiste a escolha em AsyncStorage sob a chave `@ipebook:active_neighborhood`.
 */
export function useActiveNeighborhood(
  defaultNeighborhood = "all",
): ActiveNeighborhoodHookResult {
  const isTest = process.env.NODE_ENV === "test";
  const initialNeighborhood =
    !isTest && memoryActiveNeighborhood !== null ? memoryActiveNeighborhood : defaultNeighborhood;
  const [activeNeighborhood, setActiveNeighborhood] = useState(initialNeighborhood);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    if (!isTest && memoryActiveNeighborhood !== null) return;
    let isMounted = true;
    async function loadStored() {
      try {
        const stored = await AsyncStorage.getItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY);
        if (isMounted && stored && stored.trim()) {
          const val = stored.trim();
          // Se for bairro residencial legado antigo (ex.: Centro, Paciência), migra para all (Piripiri)
          const isLegacyNeighborhood =
            val === "Centro" ||
            val === "Paciência" ||
            val === "Crioli" ||
            val === "Petecas" ||
            val === "Prado";
          const resolved = isLegacyNeighborhood ? "all" : val;
          if (!isTest) memoryActiveNeighborhood = resolved;
          setActiveNeighborhood(resolved);
        } else if (!isTest) {
          memoryActiveNeighborhood = defaultNeighborhood;
        }
      } catch {
        // Fallback para o valor inicial em caso de falha de leitura
      }
    }
    void loadStored();
    return () => {
      isMounted = false;
    };
  }, [defaultNeighborhood, isTest]);

  const openSelector = useCallback(() => {
    setIsSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    setIsSelectorOpen(false);
  }, []);

  const selectNeighborhood = useCallback(async (neighborhood: string) => {
    const trimmed = neighborhood.trim();
    if (!isTest) memoryActiveNeighborhood = trimmed;
    setActiveNeighborhood(trimmed);
    setIsSelectorOpen(false);
    try {
      await AsyncStorage.setItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY, trimmed);
    } catch {
      // Ignora erro de gravação não crítico
    }
  }, [isTest]);

  return {
    activeNeighborhood,
    isSelectorOpen,
    openSelector,
    closeSelector,
    selectNeighborhood,
  };
}
