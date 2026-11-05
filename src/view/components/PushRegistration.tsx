import { useEffect } from "react";
import { makeAuthViewModel, makeNotificationsPromptViewModel, makePushRegistration } from "@/di/container";
import { PermissionPromptDialog } from "@/view/components/PermissionPromptDialog";

export type PushRegistrationProps = {
  /** Abre a rota do aviso tocado (por exemplo, `/negociacao/<id>`). */
  onOpenRoute: (route: string) => void;
};

/**
 * Liga o push do aparelho à conta logada (Spec 096) e, antes disso, explica o motivo dos avisos
 * na primeira entrada da conta (Spec 020). Sem permissão concedida não pede token, então o aviso
 * nativo nunca aparece do nada; fora isso o componente não desenha nada.
 */
export function PushRegistration({ onOpenRoute }: PushRegistrationProps) {
  const [authState] = makeAuthViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const [prompt, promptActions] = makeNotificationsPromptViewModel();

  useEffect(() => {
    if (sessionUserId) void promptActions.refresh();
  }, [sessionUserId, promptActions]);

  makePushRegistration(sessionUserId, onOpenRoute, prompt.granted);

  return (
    <PermissionPromptDialog
      permission="notifications"
      status={prompt.status}
      onAllow={() => void promptActions.approve()}
      onLater={() => void promptActions.decline()}
      onDismiss={promptActions.dismiss}
    />
  );
}
