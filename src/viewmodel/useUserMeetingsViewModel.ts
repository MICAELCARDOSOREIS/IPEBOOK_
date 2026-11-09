import { useCallback, useEffect, useRef, useState } from "react";
import type { Meeting } from "@/model/entities/meeting";
import { DomainError } from "@/model/errors";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";

export type UserMeetingsState = {
  meetings: readonly Meeting[];
  loading: boolean;
  error: string | null;
};

export type UserMeetingsActions = {
  reload: () => Promise<void>;
};

const LOAD_ERROR = "Não foi possível carregar o histórico de encontros. Tente novamente.";
const sessionMeetingsCache = new Map<string, readonly Meeting[]>();

/** Histórico geral de encontros do usuário em suas trocas e vendas em Piripiri (Spec 071). */
export function useUserMeetingsViewModel(
  sessionUserId: string | null,
  meetingUseCases: IMeetingUseCases,
): [UserMeetingsState, UserMeetingsActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached =
    !isTest && sessionUserId ? (sessionMeetingsCache.get(sessionUserId) ?? null) : null;
  const [state, setState] = useState<UserMeetingsState>({
    meetings: initialCached ?? [],
    loading: initialCached === null,
    error: null,
  });
  const active = useRef(false);

  const reload = useCallback(async () => {
    if (!active.current) return;
    setState((previous) => ({
      ...previous,
      loading: previous.meetings.length === 0 && (!sessionUserId || !sessionMeetingsCache.has(sessionUserId)),
      error: null,
    }));
    try {
      if (!sessionUserId) {
        if (active.current) setState({ meetings: [], loading: false, error: null });
        return;
      }
      const list = await meetingUseCases.getUserMeetingHistory(sessionUserId);
      if (!isTest) sessionMeetingsCache.set(sessionUserId, list);
      if (active.current) setState({ meetings: list, loading: false, error: null });
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : LOAD_ERROR,
        }));
      }
    }
  }, [sessionUserId, meetingUseCases, isTest]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
    };
  }, [reload]);

  return [state, { reload }];
}
