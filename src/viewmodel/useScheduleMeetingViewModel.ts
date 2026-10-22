import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  logger as defaultLogger,
  meetingUseCases,
  rateLimiter as defaultRateLimiter,
} from "@/di/container";
import { MEETING_TIME_SLOTS, type Meeting } from "@/model/entities/meeting";
import { DomainError } from "@/model/errors";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import { meetingDayOptions, meetingScheduledAt } from "@/model/validators/meetingValidator";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";
import { formKey, guardFormSubmit } from "@/viewmodel/formRateLimit";

export type ScheduleMeetingState = {
  /** `reschedule` quando já há encontro ativo (`06.13`); senão `propose` (`06.04`). */
  mode: "propose" | "reschedule";
  loading: boolean;
  loadError: string | null;
  pointName: string | null;
  /** Índice em `dayOptions`. */
  dayIndex: number | null;
  hour: number | null;
  dayOptions: readonly Date[];
  timeSlots: readonly number[];
  submitting: boolean;
  error: string | null;
};

export type ScheduleMeetingActions = {
  selectPoint: (pointName: string) => void;
  selectDay: (index: number) => void;
  selectHour: (hour: number) => void;
  submit: () => Promise<boolean>;
};

const LOAD_ERROR = "Não foi possível carregar o encontro. Tente novamente.";
const SUBMIT_ERROR = "Não foi possível enviar o convite. Tente novamente.";
const MEETING_ATTEMPTS = 3;
/** Relógio padrão estável: uma função nova a cada render recalcularia os dias e recarregaria o encontro. */
const systemNow = () => new Date();

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Formulário de `06.04 · Combinar encontro` e `06.13 · Reagendar encontro` (Spec 052). */
export function useScheduleMeetingViewModel(
  requestId: string,
  sessionUserId: string | null,
  useCases: IMeetingUseCases = meetingUseCases,
  now: () => Date = systemNow,
  rateLimiter: IRateLimiter = defaultRateLimiter,
  logger: ILogger = defaultLogger,
): [ScheduleMeetingState, ScheduleMeetingActions] {
  const dayOptions = useMemo(() => meetingDayOptions(now()), [now]);
  const [current, setCurrent] = useState<Meeting | null>(null);
  const [state, setState] = useState({
    loading: true,
    loadError: null as string | null,
    pointName: null as string | null,
    dayIndex: null as number | null,
    hour: null as number | null,
    submitting: false,
    error: null as string | null,
  });
  const active = useRef(false);

  useEffect(() => {
    active.current = true;
    void (async () => {
      try {
        const meeting = await useCases.getMeeting(requestId, sessionUserId);
        if (!active.current) return;
        const ongoing = meeting && meeting.status !== "cancelled" ? meeting : null;
        setCurrent(ongoing);
        // Reagendar parte do encontro atual: local, dia (se ainda na janela) e horário.
        const scheduled = ongoing ? new Date(ongoing.scheduledAt) : null;
        const dayIndex = scheduled ? dayOptions.findIndex((day) => sameDay(day, scheduled)) : -1;
        setState((previous) => ({
          ...previous,
          loading: false,
          pointName: ongoing?.pointName ?? null,
          dayIndex: dayIndex >= 0 ? dayIndex : null,
          hour: scheduled && MEETING_TIME_SLOTS.includes(scheduled.getHours()) ? scheduled.getHours() : null,
        }));
      } catch (error) {
        if (active.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            loadError: error instanceof DomainError ? error.message : LOAD_ERROR,
          }));
        }
      }
    })();
    return () => {
      active.current = false;
    };
  }, [useCases, requestId, sessionUserId, dayOptions]);

  const selectPoint = useCallback((pointName: string) => setState((p) => ({ ...p, pointName, error: null })), []);
  const selectDay = useCallback((dayIndex: number) => setState((p) => ({ ...p, dayIndex, error: null })), []);
  const selectHour = useCallback((hour: number) => setState((p) => ({ ...p, hour, error: null })), []);

  const submit = useCallback(async (): Promise<boolean> => {
    const { pointName, dayIndex, hour } = state;
    if (!pointName || dayIndex === null || hour === null) {
      setState((p) => ({ ...p, error: "Escolha o local, o dia e o horário do encontro." }));
      return false;
    }
    const guard = guardFormSubmit(rateLimiter, formKey("meeting:schedule", requestId), MEETING_ATTEMPTS);
    if (!guard.allowed) {
      setState((p) => ({ ...p, error: guard.message }));
      return false;
    }
    setState((p) => ({ ...p, submitting: true, error: null }));
    const proposal = { pointName, scheduledAt: meetingScheduledAt(dayOptions[dayIndex], hour) };
    try {
      if (current) {
        await useCases.reschedule(current.id, proposal, sessionUserId);
      } else {
        await useCases.propose(requestId, proposal, sessionUserId);
      }
      if (active.current) setState((p) => ({ ...p, submitting: false }));
      return true;
    } catch (error) {
      logger.warn("Falha ao enviar convite de encontro", { mode: current ? "reschedule" : "propose" });
      if (active.current) {
        setState((p) => ({
          ...p,
          submitting: false,
          error: error instanceof DomainError ? error.message : SUBMIT_ERROR,
        }));
      }
      return false;
    }
  }, [state, rateLimiter, requestId, dayOptions, current, useCases, sessionUserId, logger]);

  return [
    { ...state, mode: current ? "reschedule" : "propose", dayOptions, timeSlots: MEETING_TIME_SLOTS },
    { selectPoint, selectDay, selectHour, submit },
  ];
}
