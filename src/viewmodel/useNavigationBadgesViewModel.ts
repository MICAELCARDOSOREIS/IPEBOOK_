import { useEffect, useState } from "react";
import { bookRequestUseCases, notificationUseCases } from "@/di/container";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";

export type NavigationBadgesDeps = {
  listReceivedRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
  /** Avisa quando chega algo novo (pedido recebido gera notificação); retorna o cancelamento. */
  subscribe?: (sessionUserId: string, onChange: () => void) => () => void;
};

const defaultDeps: NavigationBadgesDeps = {
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
  subscribe: (id, onChange) => notificationUseCases.subscribe?.(id, onChange) ?? (() => {}),
};

export type NavigationBadges = { conversations: number };

const NONE: NavigationBadges = { conversations: 0 };

/**
 * Contadores da barra de navegação (Spec 091): propostas recebidas esperando resposta aparecem como
 * selo em "Conversas". Atualiza ao mudar de tela (`refreshKey`) e quando chega aviso em tempo real.
 */
export function useNavigationBadgesViewModel(
  sessionUserId: string | null,
  refreshKey: string,
  deps: NavigationBadgesDeps = defaultDeps,
): NavigationBadges {
  const [badges, setBadges] = useState<NavigationBadges>(NONE);

  useEffect(() => {
    if (!sessionUserId) {
      setBadges(NONE);
      return;
    }
    let active = true;
    const load = () => {
      deps
        .listReceivedRequests(sessionUserId)
        .then((list) => {
          if (active) setBadges({ conversations: list.filter((e) => e.request.status === "pending").length });
        })
        .catch(() => {
          /* o selo é só um aviso; sem rede ele mantém o último valor */
        });
    };
    load();
    const off = deps.subscribe?.(sessionUserId, load);
    return () => {
      active = false;
      off?.();
    };
  }, [sessionUserId, refreshKey, deps]);

  return badges;
}
