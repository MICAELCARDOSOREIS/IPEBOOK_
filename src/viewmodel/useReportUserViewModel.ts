import { useCallback, useRef, useState } from "react";
import type { UserReportReason } from "@/model/entities/report";
import { DomainError } from "@/model/errors";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import type { IReportUseCases } from "@/usecase/iReportUseCases";
import { formKey, guardFormSubmit } from "@/viewmodel/formRateLimit";

export type ReportUserState = {
  reason: UserReportReason | null;
  details: string;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type ReportUserActions = {
  setReason: (reason: UserReportReason) => void;
  setDetails: (details: string) => void;
  submit: (reportedUserId: string, sessionUserId: string | null) => Promise<boolean>;
};

const INITIAL: ReportUserState = { reason: null, details: "", loading: false, error: null, success: false };
const GENERIC_ERROR = "Não foi possível enviar a denúncia. Tente novamente.";

/** Denúncia de pessoa a partir do perfil público (Spec 091). */
export function useReportUserViewModel(
  useCases: IReportUseCases,
  rateLimiter?: IRateLimiter,
): [ReportUserState, ReportUserActions] {
  const [state, setState] = useState<ReportUserState>(INITIAL);
  const sending = useRef(false);

  const setReason = useCallback((reason: UserReportReason) => setState((prev) => ({ ...prev, reason, error: null })), []);
  const setDetails = useCallback((details: string) => setState((prev) => ({ ...prev, details, error: null })), []);

  const submit = useCallback(
    async (reportedUserId: string, sessionUserId: string | null) => {
      if (sending.current) return false;
      if (!sessionUserId) {
        setState((prev) => ({ ...prev, error: "Você precisa entrar na sua conta para denunciar uma pessoa." }));
        return false;
      }
      if (reportedUserId === sessionUserId) {
        setState((prev) => ({ ...prev, error: "Você não pode denunciar a própria conta." }));
        return false;
      }
      if (!state.reason) {
        setState((prev) => ({ ...prev, error: "Selecione um motivo para a denúncia." }));
        return false;
      }
      if (rateLimiter) {
        const guard = guardFormSubmit(rateLimiter, formKey("report:user:submit", sessionUserId), 3);
        if (!guard.allowed) {
          setState((prev) => ({ ...prev, error: guard.message }));
          return false;
        }
      }
      sending.current = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await useCases.submitUserReport(
          { reportedUserId, reason: state.reason, details: state.details || undefined },
          sessionUserId,
        );
        setState((prev) => ({ ...prev, loading: false, success: true }));
        return true;
      } catch (err) {
        setState((prev) => ({ ...prev, loading: false, error: err instanceof DomainError ? err.message : GENERIC_ERROR }));
        return false;
      } finally {
        sending.current = false;
      }
    },
    [state.reason, state.details, useCases, rateLimiter],
  );

  return [state, { setReason, setDetails, submit }];
}
