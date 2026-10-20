import { useCallback, useState } from "react";
import {
  authUseCases,
  fileDownloadService,
  searchHistoryUseCases,
  userDataExportUseCases,
} from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IFileDownloadService } from "@/model/services/iFileDownloadService";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import type { IUserDataExportUseCases } from "@/usecase/iUserDataExportUseCases";

export type DeleteAccountState = {
  confirmed: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
  exporting: boolean;
  exportSuccess: boolean;
  exportError: string | null;
};

export type DeleteAccountActions = {
  setConfirmed: (confirmed: boolean) => void;
  deleteAccount: (sessionUserId: string | null) => Promise<boolean>;
  downloadUserData: (sessionUserId: string | null) => Promise<boolean>;
  reset: () => void;
};

const INITIAL_STATE: DeleteAccountState = {
  confirmed: false,
  loading: false,
  error: null,
  success: false,
  exporting: false,
  exportSuccess: false,
  exportError: null,
};

const GENERIC_ERROR = "Não foi possível excluir sua conta. Tente novamente.";
const EXPORT_ERROR = "Não foi possível exportar seus dados no momento. Tente novamente.";

export function useDeleteAccountViewModel(
  auth: IAuthUseCases = authUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
  exportUseCases: IUserDataExportUseCases = userDataExportUseCases,
  download: IFileDownloadService = fileDownloadService,
): [DeleteAccountState, DeleteAccountActions] {
  const [state, setState] = useState<DeleteAccountState>(INITIAL_STATE);

  const setConfirmed = useCallback((confirmed: boolean) => {
    setState((prev) => ({ ...prev, confirmed, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const downloadUserData = useCallback(
    async (sessionUserId: string | null): Promise<boolean> => {
      if (!sessionUserId) {
        setState((prev) => ({
          ...prev,
          exportError: "Você precisa estar conectado para baixar seus dados.",
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        exporting: true,
        exportError: null,
        exportSuccess: false,
      }));

      try {
        const data = await exportUseCases.exportUserData(sessionUserId);
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `meus-dados-ipebook-${dateStr}.json`;
        const ok = await download.downloadJson(filename, data);
        if (ok) {
          setState((prev) => ({
            ...prev,
            exporting: false,
            exportSuccess: true,
            exportError: null,
          }));
          return true;
        }
        throw new Error("Falha no download");
      } catch (err) {
        setState((prev) => ({
          ...prev,
          exporting: false,
          exportSuccess: false,
          exportError: err instanceof DomainError ? err.message : EXPORT_ERROR,
        }));
        return false;
      }
    },
    [exportUseCases, download],
  );

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

  return [state, { setConfirmed, deleteAccount, downloadUserData, reset }];
}
