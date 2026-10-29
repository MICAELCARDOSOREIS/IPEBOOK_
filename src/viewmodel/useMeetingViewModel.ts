import { useCallback, useEffect, useRef, useState } from "react";
import {
  logger as defaultLogger,
  meetingUseCases,
  rateLimiter as defaultRateLimiter,
} from "@/di/container";
import type { Meeting } from "@/model/entities/meeting";
import { DomainError } from "@/model/errors";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";
import { formKey, guardFormSubmit } from "@/viewmodel/formRateLimit";

export type MeetingState = {
  meeting: Meeting | null;
  loading: boolean;
  error: string | null;
  busy: boolean;
  actionError: string | null;
};

export type MeetingActions = {
  reload: () => Promise<void>;
  confirm: () => Promise<boolean>;
  cancel: () => Promise<boolean>;
};

const LOAD_ERROR = "Não foi possível carregar o encontro. Tente novamente.";
const ACTION_ERROR = "Não foi possível atualizar o encontro. Tente novamente.";
/** Respostas ao encontro por minuto, como os demais formulários (ADR 0027). */
const MEETING_ATTEMPTS = 3;

/** Encontro de uma negociação aceita, com confirmar e cancelar (Spec 052, `06.05`, `06.11`). */
export function useMeetingViewModel(
  requestId: string,
  sessionUserId: string | null,
  useCases: IMeetingUseCases = meetingUseCases,
  rateLimiter: IRateLimiter = defaultRateLimiter,
  logger: ILogger = defaultLogger,
): [MeetingState, MeetingActions] {
  const [state, setState] = useState<MeetingState>({
    meeting: null,
    loading: true,
    error: null,
    busy: false,
    actionError: null,
  });
  const active = useRef(false);

  const reload = useCallback(async () => {
    if (!active.current) return;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const meeting = await useCases.getMeeting(requestId, sessionUserId);
      if (active.current) setState((previous) => ({ ...previous, meeting, loading: false }));
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : LOAD_ERROR,
        }));
      }
    }
  }, [useCases, requestId, sessionUserId]);

  const run = useCallback(
    async (action: "confirm" | "cancel"): Promise<boolean> => {
      const meeting = state.meeting;
      if (!meeting) return false;
      const guard = guardFormSubmit(rateLimiter, formKey(`meeting:${action}`, requestId), MEETING_ATTEMPTS);
      if (!guard.allowed) {
        setState((previous) => ({ ...previous, actionError: guard.message }));
        return false;
      }
      setState((previous) => ({ ...previous, busy: true, actionError: null }));
      try {
        const updated = action === "confirm"
          ? await useCases.confirm(meeting.id, sessionUserId)
          : await useCases.cancel(meeting.id, sessionUserId);
        if (active.current) setState((previous) => ({ ...previous, meeting: updated, busy: false }));
        return true;
      } catch (error) {
        logger.warn("Falha ao responder ao encontro", { action });
        if (active.current) {
          setState((previous) => ({
            ...previous,
            busy: false,
            actionError: error instanceof DomainError ? error.message : ACTION_ERROR,
          }));
        }
        return false;
      }
    },
    [state.meeting, rateLimiter, requestId, useCases, sessionUserId, logger],
  );

  const confirm = useCallback(() => run("confirm"), [run]);
  const cancel = useCallback(() => run("cancel"), [run]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
    };
  }, [reload]);

  return [state, { reload, confirm, cancel }];
}
