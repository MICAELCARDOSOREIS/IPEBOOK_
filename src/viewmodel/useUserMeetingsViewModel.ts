import { useCallback, useEffect, useRef, useState } from "react";
import { meetingUseCases as defaultMeetingUseCases } from "@/di/container";
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

/** Histórico geral de encontros do usuário em suas trocas e vendas em Piripiri (Spec 071). */
export function useUserMeetingsViewModel(
  sessionUserId: string | null,
  meetingUseCases: IMeetingUseCases = defaultMeetingUseCases,
): [UserMeetingsState, UserMeetingsActions] {
  const [state, setState] = useState<UserMeetingsState>({
    meetings: [],
    loading: true,
    error: null,
  });
  const active = useRef(false);

  const reload = useCallback(async () => {
    if (!active.current) return;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      if (!sessionUserId) {
        if (active.current) setState({ meetings: [], loading: false, error: null });
        return;
      }
      const list = await meetingUseCases.getUserMeetingHistory(sessionUserId);
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
  }, [sessionUserId, meetingUseCases]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
    };
  }, [reload]);

  return [state, { reload }];
}
