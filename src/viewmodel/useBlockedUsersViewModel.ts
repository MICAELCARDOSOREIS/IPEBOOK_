import { useCallback, useEffect, useRef, useState } from "react";
import { blockedUserUseCases } from "@/di/container";
import type { BlockedUser } from "@/model/entities/blockedUser";
import { DomainError } from "@/model/errors";
import type { IBlockedUserUseCases } from "@/usecase/iBlockedUserUseCases";

export type BlockedUsersState = {
  blockedUsers: readonly BlockedUser[];
  loading: boolean;
  error: string | null;
  unblockingId: string | null;
  actionMessage: string | null;
};

export type BlockedUsersActions = {
  reload: () => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<boolean>;
  clearActionMessage: () => void;
};

const GENERIC_ERROR = "Não foi possível carregar as pessoas bloqueadas. Tente novamente.";

export function useBlockedUsersViewModel(
  sessionUserId: string | null,
  useCases: IBlockedUserUseCases = blockedUserUseCases,
): [BlockedUsersState, BlockedUsersActions] {
  const [state, setState] = useState<BlockedUsersState>({
    blockedUsers: [],
    loading: true,
    error: null,
    unblockingId: null,
    actionMessage: null,
  });

  const active = useRef(false);
  const requestCount = useRef(0);

  const reload = useCallback(async () => {
    if (!sessionUserId) {
      setState({
        blockedUsers: [],
        loading: false,
        error: "Sessão necessária para acessar pessoas bloqueadas.",
        unblockingId: null,
        actionMessage: null,
      });
      return;
    }

    const current = ++requestCount.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const list = await useCases.listBlockedUsers(sessionUserId);
      if (active.current && current === requestCount.current) {
        setState((prev) => ({
          ...prev,
          blockedUsers: list,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      if (active.current && current === requestCount.current) {
        const error = err instanceof DomainError ? err.message : GENERIC_ERROR;
        setState((prev) => ({ ...prev, loading: false, error }));
      }
    }
  }, [sessionUserId, useCases]);

  useEffect(() => {
    active.current = true;
    reload();
    return () => {
      active.current = false;
    };
  }, [reload]);

  const unblockUser = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      if (!sessionUserId) return false;
      setState((prev) => ({ ...prev, unblockingId: targetUserId, error: null }));
      try {
        await useCases.unblockUser(sessionUserId, targetUserId);
        if (active.current) {
          setState((prev) => ({
            ...prev,
            blockedUsers: prev.blockedUsers.filter((u) => u.userId !== targetUserId),
            unblockingId: null,
            actionMessage: "Pessoa desbloqueada com sucesso.",
          }));
        }
        return true;
      } catch (err) {
        if (active.current) {
          const error = err instanceof DomainError ? err.message : "Não foi possível desbloquear.";
          setState((prev) => ({ ...prev, unblockingId: null, error }));
        }
        return false;
      }
    },
    [sessionUserId, useCases],
  );

  const clearActionMessage = useCallback(() => {
    setState((prev) => ({ ...prev, actionMessage: null }));
  }, []);

  return [state, { reload, unblockUser, clearActionMessage }];
}
