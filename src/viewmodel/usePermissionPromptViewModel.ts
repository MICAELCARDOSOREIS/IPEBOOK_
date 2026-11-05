import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IPermissionPromptUseCases } from "@/usecase/iPermissionPromptUseCases";

/** Estado do aviso explicativo antes do prompt nativo (Spec 020). */
export type PermissionPromptStatus = "idle" | "explain" | "requesting" | "denied";

export type PermissionPromptState = {
  status: PermissionPromptStatus;
  /** Permissão já concedida no aparelho: a funcionalidade pode usar o recurso e gravar o token. */
  granted: boolean;
};

export type PermissionPromptActions = {
  /** Consulta o aparelho e o registro: abre a explicação só quando ainda faz sentido perguntar. */
  refresh: () => Promise<void>;
  /** "Permitir": abre o prompt do sistema. Devolve se concedeu; em caso de recusa entra em "denied". */
  approve: () => Promise<boolean>;
  /** "Agora não": fecha sem abrir o prompt e registra a pergunta para não insistir. */
  decline: () => Promise<void>;
  /** Fecha o aviso de recurso indisponível sem alterar o registro. */
  dismiss: () => void;
};

/**
 * Prompt de permissão (Spec 020 T004): mostrar o motivo, pedir depois e tratar a recusa sem travar o app.
 * A copy das telas fica na view; aqui só o estado e as transições.
 */
export function usePermissionPromptViewModel(
  prompts: IPermissionPromptUseCases,
): [PermissionPromptState, PermissionPromptActions] {
  const [state, setState] = useState<PermissionPromptState>({ status: "idle", granted: false });
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const write = useCallback(
    (patch: Partial<PermissionPromptState>) => {
      if (active.current) setState((previous) => ({ ...previous, ...patch }));
    },
    [],
  );

  const refresh = useCallback(async () => {
    const decision = await prompts.resolve();
    if (decision === "granted") write({ status: "idle", granted: true });
    else if (decision === "explain") write({ status: "explain", granted: false });
    else write({ status: "idle", granted: false });
  }, [prompts, write]);

  const approve = useCallback(async () => {
    write({ status: "requesting" });
    const granted = await prompts.request();
    write(granted ? { status: "idle", granted: true } : { status: "denied", granted: false });
    return granted;
  }, [prompts, write]);

  const decline = useCallback(async () => {
    await prompts.markAsked();
    write({ status: "idle" });
  }, [prompts, write]);

  const dismiss = useCallback(() => write({ status: "idle" }), [write]);

  const actions = useMemo<PermissionPromptActions>(
    () => ({ refresh, approve, decline, dismiss }),
    [refresh, approve, decline, dismiss],
  );
  return [state, actions];
}
