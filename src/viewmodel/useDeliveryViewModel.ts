import { useCallback, useEffect, useRef, useState } from "react";
import type { Delivery, DeliveryCode } from "@/model/entities/delivery";
import { DomainError } from "@/model/errors";
import type { DeliveryRole, IDeliveryUseCases } from "@/usecase/iDeliveryUseCases";
import { useAppForegroundRefresh, useDebouncedRealtimeCallback } from "@/viewmodel/useRealtimeSync";

export type DeliveryState = {
  loading: boolean;
  loadError: string | null;
  role: DeliveryRole | null;
  /** Preenchido quando as duas pessoas já confirmaram a entrega. */
  completed: Delivery | null;
  /** Código atual do anunciante (QR e texto). */
  code: DeliveryCode | null;
  generating: boolean;
  confirming: boolean;
  error: string | null;
};

export type DeliveryActions = {
  /** Anunciante: gera um código novo e invalida o anterior. */
  generate: () => Promise<void>;
  /** Leitor: confirma a entrega com o código lido ou digitado. */
  confirm: (code: string) => Promise<boolean>;
  reload: () => Promise<void>;
};

const LOAD_ERROR = "Não foi possível carregar a entrega. Tente novamente.";
const POLL_MS = 4000;

function messageOf(error: unknown, fallback: string): string {
  return error instanceof DomainError ? error.message : fallback;
}

/**
 * Tela "Entrega do livro" (Spec 095): o anunciante mostra o QR e o leitor o confirma. Quem mostra o QR
 * consulta a entrega de tempos em tempos para saber quando a outra pessoa concluiu.
 */
export function useDeliveryViewModel(
  requestId: string,
  sessionUserId: string | null,
  useCases: IDeliveryUseCases,
  pollMs: number = POLL_MS,
  subscribe?: (requestId: string, sessionUserId: string, onChange: () => void) => () => void,
): [DeliveryState, DeliveryActions] {
  const [state, setState] = useState<DeliveryState>({
    loading: true,
    loadError: null,
    role: null,
    completed: null,
    code: null,
    generating: false,
    confirming: false,
    error: null,
  });
  const active = useRef(true);

  const generate = useCallback(async () => {
    setState((s) => ({ ...s, generating: true, error: null }));
    try {
      const code = await useCases.generateCode(requestId, sessionUserId);
      if (active.current) setState((s) => ({ ...s, code, generating: false }));
    } catch (error) {
      if (active.current) setState((s) => ({ ...s, generating: false, error: messageOf(error, "Não foi possível gerar o código.") }));
    }
  }, [requestId, sessionUserId, useCases]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, loadError: null }));
    try {
      const role = await useCases.getRole(requestId, sessionUserId);
      const completed = await useCases.getDelivery(requestId, sessionUserId);
      if (!active.current) return;
      setState((s) => ({ ...s, loading: false, role, completed }));
      if (role === "giver" && !completed) await generate();
    } catch (error) {
      if (active.current) setState((s) => ({ ...s, loading: false, loadError: messageOf(error, LOAD_ERROR) }));
    }
  }, [requestId, sessionUserId, useCases, generate]);

  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [load]);

  // O anunciante espera a leitura: recebe em tempo real e mantém polling de segurança.
  const waiting = state.role === "giver" && !state.completed && state.code !== null;
  const checkCompleted = useCallback(() => {
    useCases
      .getDelivery(requestId, sessionUserId)
      .then((completed) => {
        if (active.current && completed) setState((s) => ({ ...s, completed }));
      })
      .catch(() => {});
  }, [requestId, sessionUserId, useCases]);
  const debouncedCheck = useDebouncedRealtimeCallback(checkCompleted);

  useEffect(() => {
    if (!waiting || !sessionUserId || !subscribe) return;
    return subscribe(requestId, sessionUserId, debouncedCheck);
  }, [waiting, requestId, sessionUserId, subscribe, debouncedCheck]);

  useEffect(() => {
    if (!waiting || pollMs <= 0) return;
    const timer = setInterval(checkCompleted, pollMs);
    return () => clearInterval(timer);
  }, [waiting, pollMs, checkCompleted]);

  useAppForegroundRefresh(checkCompleted, waiting);

  const confirm = useCallback(
    async (code: string) => {
      setState((s) => ({ ...s, confirming: true, error: null }));
      try {
        const completed = await useCases.confirmDelivery(requestId, code, sessionUserId);
        if (active.current) setState((s) => ({ ...s, confirming: false, completed }));
        return true;
      } catch (error) {
        if (active.current) setState((s) => ({ ...s, confirming: false, error: messageOf(error, "Não foi possível confirmar a entrega.") }));
        return false;
      }
    },
    [requestId, sessionUserId, useCases],
  );

  return [state, { generate, confirm, reload: load }];
}

export type DeliveryStatus = { loading: boolean; role: DeliveryRole | null; completed: Delivery | null };

/** Só consulta o papel e se a entrega já foi concluída (sem gerar código), com tempo real para o cartão da negociação. */
export function useDeliveryStatus(
  requestId: string,
  sessionUserId: string | null,
  refreshKey: number = 0,
  useCases: IDeliveryUseCases,
  subscribe?: (requestId: string, sessionUserId: string, onChange: () => void) => () => void,
): DeliveryStatus {
  const [status, setStatus] = useState<DeliveryStatus>({ loading: true, role: null, completed: null });
  const activeRef = useRef(true);

  const loadStatus = useCallback(async () => {
    if (!requestId || !sessionUserId) return;
    try {
      const role = await useCases.getRole(requestId, sessionUserId);
      const completed = await useCases.getDelivery(requestId, sessionUserId);
      if (activeRef.current) setStatus({ loading: false, role, completed });
    } catch {
      if (activeRef.current) setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [requestId, sessionUserId, useCases]);

  const debouncedLoad = useDebouncedRealtimeCallback(() => {
    void loadStatus();
  });

  useEffect(() => {
    activeRef.current = true;
    void loadStatus();
    return () => {
      activeRef.current = false;
    };
  }, [loadStatus, refreshKey]);

  useEffect(() => {
    if (!requestId || !sessionUserId || !subscribe) return;
    return subscribe(requestId, sessionUserId, debouncedLoad);
  }, [requestId, sessionUserId, subscribe, debouncedLoad]);

  useAppForegroundRefresh(() => {
    void loadStatus();
  }, Boolean(requestId && sessionUserId));

  return status;
}
