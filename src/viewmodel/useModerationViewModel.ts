import { useCallback, useEffect, useState } from "react";
import { moderationUseCases } from "@/di/container";
import type { ModerationDecision, ModerationItem } from "@/model/entities/moderation";
import type { IModerationUseCases } from "@/usecase/iModerationUseCases";
import { messageOf, useRequestList } from "@/viewmodel/useSentRequestsViewModel";

export type ModerationState = {
  items: readonly ModerationItem[];
  loading: boolean;
  error: string | null;
  /** Alvo com decisão em andamento, para travar os botões dele. */
  decidingId: string | null;
  actionMessage: string | null;
};

export type ModerationActions = {
  reload: () => Promise<void>;
  decide: (item: ModerationItem, decision: ModerationDecision, note?: string) => Promise<boolean>;
  clearActionMessage: () => void;
};

const LOAD_ERROR = "Não foi possível carregar as denúncias. Tente novamente.";
const DONE: Record<ModerationDecision, string> = {
  dismiss: "Denúncias arquivadas.",
  remove_listing: "Anúncio removido.",
  suspend_user: "Conta suspensa.",
};

/** Fila da moderação (Spec 102): carrega, decide e recarrega. */
export function useModerationViewModel(
  sessionUserId: string | null,
  useCases: IModerationUseCases = moderationUseCases,
): [ModerationState, ModerationActions] {
  const load = useCallback(() => useCases.listQueue(sessionUserId), [useCases, sessionUserId]);
  const [list, reload, active] = useRequestList<ModerationItem>(load, LOAD_ERROR);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const decide = useCallback(
    async (item: ModerationItem, decision: ModerationDecision, note?: string) => {
      setDecidingId(item.targetId);
      try {
        await useCases.decide(item, decision, sessionUserId, note);
        if (active.current) setActionMessage(DONE[decision]);
        await reload();
        return true;
      } catch (error) {
        if (active.current) setActionMessage(messageOf(error, "Não foi possível registrar a decisão."));
        return false;
      } finally {
        if (active.current) setDecidingId(null);
      }
    },
    [useCases, sessionUserId, reload, active],
  );

  return [
    { ...list, decidingId, actionMessage },
    { reload, decide, clearActionMessage: () => setActionMessage(null) },
  ];
}

/** Se a conta atual é moderadora (mostra o acesso em Configurações). */
export function useIsModerator(
  sessionUserId: string | null,
  useCases: IModerationUseCases = moderationUseCases,
): boolean {
  const [moderator, setModerator] = useState(false);
  useEffect(() => {
    let alive = true;
    void useCases.isModerator(sessionUserId).then((value) => {
      if (alive) setModerator(value);
    });
    return () => {
      alive = false;
    };
  }, [useCases, sessionUserId]);
  return moderator;
}
