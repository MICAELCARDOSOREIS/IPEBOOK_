import { useCallback, useState } from "react";
import { authUseCases, searchHistoryUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";

export type DeleteAccountState = {
  confirmed: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type DeleteAccountActions = {
  setConfirmed: (confirmed: boolean) => void;
  deleteAccount: (sessionUserId: string | null) => Promise<boolean>;
  reset: () => void;
};

const INITIAL_STATE: DeleteAccountState = {
  confirmed: false,
  loading: false,
  error: null,
  success: false,
};

const GENERIC_ERROR = "Não foi possível excluir sua conta. Tente novamente.";

export function useDeleteAccountViewModel(
  auth: IAuthUseCases = authUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [DeleteAccountState, DeleteAccountActions] {
  const [state, setState] = useState<DeleteAccountState>(INITIAL_STATE);

  const setConfirmed = useCallback((confirmed: boolean) => {
    setState((prev) => ({ ...prev, confirmed, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const deleteAccount = useCallback(
    async (sessionUserId: string | null): Promise<boolean> => {
      if (!sessionUserId) {
        setState((prev) => ({
          ...prev,
          error: "Você precisa estar conectado para excluir a conta.",
        }));
        return false;
      }

      if (!state.confirmed) {
        setState((prev) => ({
          ...prev,
          error: "Você deve confirmar que compreende as consequências da exclusão.",
        }));
        return false;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await auth.deleteAccount(sessionUserId);
        await history.clearHistory(sessionUserId);
        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          error: null,
        }));
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof DomainError ? err.message : GENERIC_ERROR,
        }));
        return false;
      }
    },
    [auth, history, state.confirmed],
  );

  return [state, { setConfirmed, deleteAccount, reset }];
}
