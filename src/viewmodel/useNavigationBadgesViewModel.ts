import { useCallback, useEffect, useRef, useState } from "react";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import { useAppForegroundRefresh, useDebouncedRealtimeCallback } from "@/viewmodel/useRealtimeSync";

export type NavigationBadgesDeps = {
  listReceivedRequests: (sessionUserId: string | null) => Promise<readonly RequestWithListing[]>;
  /** Avisa quando chega algo novo (pedido recebido gera notificação); retorna o cancelamento. */
  subscribe?: (sessionUserId: string, onChange: () => void) => () => void;
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
  deps: NavigationBadgesDeps,
): NavigationBadges {
  const [badges, setBadges] = useState<NavigationBadges>(NONE);
  const activeRef = useRef(true);

  const load = useCallback(() => {
    if (!sessionUserId) {
      setBadges(NONE);
      return;
    }
    deps
      .listReceivedRequests(sessionUserId)
      .then((list) => {
        if (activeRef.current) setBadges({ conversations: list.filter((e) => e.request.status === "pending").length });
      })
      .catch(() => {
        /* o selo é só um aviso; sem rede ele mantém o último valor */
      });
  }, [sessionUserId, deps]);

  const debouncedLoad = useDebouncedRealtimeCallback(load, 200);

  useEffect(() => {
    activeRef.current = true;
    load();
    const off = sessionUserId ? deps.subscribe?.(sessionUserId, debouncedLoad) : undefined;
    return () => {
      activeRef.current = false;
      off?.();
    };
  }, [sessionUserId, refreshKey, deps, load, debouncedLoad]);

  useAppForegroundRefresh(load, Boolean(sessionUserId));

  return badges;
}
