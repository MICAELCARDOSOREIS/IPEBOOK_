import { useEffect, type ReactNode } from "react";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

export type RequireAuthProps = {
  /** Chamada quando a pessoa não tem sessão ativa (ex.: replaceOnce("/entrar")). */
  onRequireSignIn: () => void;
  children: ReactNode;
};

/**
 * Rede de segurança de acesso (Spec 092): o catálogo só é servido a pessoas conectadas.
 * Enquanto a sessão é verificada ou quando não há usuário, nada é renderizado e a rota
 * de destino é acionada uma única vez — o mesmo padrão de `MyListingsScreen`.
 */
export function RequireAuth({ onRequireSignIn, children }: RequireAuthProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <>{children}</>;
}
