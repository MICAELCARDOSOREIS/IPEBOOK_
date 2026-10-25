import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACTIVE_NEIGHBORHOOD_STORAGE_KEY = "@ipebook:active_neighborhood";

export type ActiveNeighborhoodHookResult = {
  activeNeighborhood: string;
  isSelectorOpen: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  selectNeighborhood: (neighborhood: string) => Promise<void>;
};

/**
 * Hook para gerenciar e persistir o bairro ativo do leitor em Piripiri, PI (Spec 067 / ADR 0050).
 * Persiste a escolha em AsyncStorage sob a chave `@ipebook:active_neighborhood`.
 */
export function useActiveNeighborhood(
  defaultNeighborhood = "Centro",
): ActiveNeighborhoodHookResult {
  const [activeNeighborhood, setActiveNeighborhood] = useState(defaultNeighborhood);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStored() {
      try {
        const stored = await AsyncStorage.getItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY);
        if (isMounted && stored && stored.trim()) {
          setActiveNeighborhood(stored.trim());
        }
      } catch {
        // Fallback para o valor inicial em caso de falha de leitura
      }
    }
    void loadStored();
    return () => {
      isMounted = false;
    };
  }, []);

  const openSelector = useCallback(() => {
    setIsSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    setIsSelectorOpen(false);
  }, []);

  const selectNeighborhood = useCallback(async (neighborhood: string) => {
    const trimmed = neighborhood.trim();
    setActiveNeighborhood(trimmed);
    setIsSelectorOpen(false);
    try {
      await AsyncStorage.setItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY, trimmed);
    } catch {
      // Ignora erro de gravação não crítico
    }
  }, []);

  return {
    activeNeighborhood,
    isSelectorOpen,
    openSelector,
    closeSelector,
    selectNeighborhood,
  };
}
