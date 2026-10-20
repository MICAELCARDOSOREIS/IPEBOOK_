import { useCallback, useState } from "react";
import { DomainError } from "@/model/errors";

export type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

export type UseAsyncStateResult<T> = AsyncState<T> & {
  /** Executa `fn`, atualizando loading/error/data de forma padronizada. */
  run: (fn: () => Promise<T>) => Promise<T | undefined>;
};

/**
 * Hook utilitário para padronizar loading/error nos ViewModels (Spec 021), reaproveitável em
 * novas telas. Não substitui o estado interno já existente nos ViewModels atuais — é a base
 * recomendada para ViewModels novos ou para uma futura migração incremental dos existentes.
 */
export function useAsyncState<T>(initialData: T): UseAsyncStateResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: initialData, loading: false, error: null });

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        loading: false,
        error: error instanceof DomainError ? error.message : "Não foi possível completar a operação.",
      }));
      return undefined;
    }
  }, []);

  return { ...state, run };
}

export default useAsyncState;
