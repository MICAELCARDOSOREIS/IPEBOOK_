import { useCallback, useState } from "react";
import { reportUseCases } from "@/di/container";
import type { ReportReason } from "@/model/entities/report";
import { DomainError } from "@/model/errors";
import type { IReportUseCases } from "@/usecase/iReportUseCases";

export type ReportListingState = {
  reason: ReportReason | null;
  details: string;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type ReportListingActions = {
  setReason: (reason: ReportReason) => void;
  setDetails: (details: string) => void;
  submit: (listingId: string, sessionUserId: string | null) => Promise<boolean>;
  reset: () => void;
};

const INITIAL_STATE: ReportListingState = {
  reason: null,
  details: "",
  loading: false,
  error: null,
  success: false,
};

const GENERIC_ERROR = "Não foi possível enviar a denúncia. Tente novamente.";

export function useReportListingViewModel(
  useCases: IReportUseCases = reportUseCases,
): [ReportListingState, ReportListingActions] {
  const [state, setState] = useState<ReportListingState>(INITIAL_STATE);

  const setReason = useCallback((reason: ReportReason) => {
    setState((prev) => ({ ...prev, reason, error: null }));
  }, []);

  const setDetails = useCallback((details: string) => {
    setState((prev) => ({ ...prev, details, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const submit = useCallback(
    async (listingId: string, sessionUserId: string | null): Promise<boolean> => {
      if (!sessionUserId) {
        setState((prev) => ({
          ...prev,
          error: "Você precisa entrar na sua conta para denunciar um anúncio.",
        }));
        return false;
      }

      if (!state.reason) {
        setState((prev) => ({
          ...prev,
          error: "Selecione um motivo para a denúncia.",
        }));
        return false;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await useCases.submitReport(
          {
            listingId,
            reason: state.reason,
            details: state.details || undefined,
          },
          sessionUserId,
        );

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          error: null,
        }));
        return true;
      } catch (err) {
        const message = err instanceof DomainError ? err.message : GENERIC_ERROR;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
        return false;
      }
    },
    [state.reason, state.details, useCases],
  );

  return [state, { setReason, setDetails, submit, reset }];
}
