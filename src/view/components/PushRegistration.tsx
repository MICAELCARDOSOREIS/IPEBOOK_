import { useEffect } from "react";
import { makeAuthViewModel, makeNotificationsPromptViewModel, makePushRegistration } from "@/di/container";
import { PermissionPromptDialog } from "@/view/components/PermissionPromptDialog";

export type PushRegistrationProps = {
  /** Rota atual: renova sessão e permissão a cada navegação, porque login e aviso acontecem em outras telas. */
  pathname: string;
  /** Abre a rota do aviso tocado (por exemplo, `/negociacao/<id>`). */
  onOpenRoute: (route: string) => void;
};

/**
 * Liga o push do aparelho à conta logada (Spec 096) e, antes disso, explica o motivo dos avisos
 * na primeira entrada da conta (Spec 020). Sem permissão concedida não pede token, então o aviso
 * nativo nunca aparece do nada; fora disso o componente não desenha nada.
 */
export function PushRegistration({ pathname, onOpenRoute }: PushRegistrationProps) {
  const [authState, authActions] = makeAuthViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const [prompt, promptActions] = makeNotificationsPromptViewModel();

  useEffect(() => {
    if (!sessionUserId) void authActions.refreshSession?.();
  }, [pathname, sessionUserId, authActions]);

  useEffect(() => {
    // A permissão também pode ser concedida em outra tela (Central de notificações, Spec 127):
    // reler a cada navegação é o que libera o registro do token na mesma execução.
    if (sessionUserId) void promptActions.refresh();
  }, [sessionUserId, pathname, promptActions]);

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
