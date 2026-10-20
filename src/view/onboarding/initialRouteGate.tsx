import { useEffect, type ReactNode } from "react";
import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";

export type InitialRouteGateProps = {
  pathname: string;
  onShowWelcome: () => void;
  children: ReactNode;
};

/**
 * AD-18: ponto único que decide a rota inicial. Ao abrir o app em "/" sem a marca de primeiro
 * acesso, leva às boas-vindas uma única vez; depois disso não redireciona de novo. Enquanto a
 * decisão está pendente, a rota inicial não aparece para evitar piscar o catálogo.
 */
export function InitialRouteGate({ pathname, onShowWelcome, children }: InitialRouteGateProps) {
  const [status] = useWelcomeGateViewModel();

  useEffect(() => {
    if (status === "show" && pathname === "/") onShowWelcome();
    // Depende só do status: a decisão vale para a abertura, não para cada navegação posterior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "checking" && pathname === "/") return null;
  return <>{children}</>;
}

export default InitialRouteGate;
