import { useEffect, type ReactNode } from "react";
import { makeAuthViewModel } from "@/di/container";
import { LoadingState } from "@/view/components/LoadingState";

export type RequireAuthProps = {
  /** Chamada quando a pessoa não tem sessão ativa (ex.: replaceOnce("/entrar")). */
  onRequireSignIn: () => void;
  children: ReactNode;
};

/**
 * Rede de segurança de acesso (Spec 092): o catálogo só é servido a pessoas conectadas.
 * Enquanto a sessão é verificada mostra o estado de carregamento; quando não há usuário,
 * nada é renderizado e a rota de destino é acionada uma única vez.
 */
export function RequireAuth({ onRequireSignIn, children }: RequireAuthProps) {
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading) return <LoadingState label="Verificando sua sessão" />;
  if (!authState.user) return null;
  return <>{children}</>;
}
