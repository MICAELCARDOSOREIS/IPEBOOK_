import Welcome from "@/view/onboarding/welcome";
import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";

export type WelcomeDestination = "/criar-conta" | "/entrar" | "/";

export type WelcomeRouteProps = {
  onFinish: (destination: WelcomeDestination) => void;
  onHelp?: () => void;
  onTerms?: () => void;
};

/** Liga a tela de boas-vindas à marca de primeiro acesso antes de sair dela (ADR 0022). */
export default function WelcomeRoute({ onFinish, onHelp, onTerms }: WelcomeRouteProps) {
  const [, dismiss] = useWelcomeGateViewModel();

  const finish = (destination: WelcomeDestination) => {
    void dismiss();
    onFinish(destination);
  };

  return (
    <Welcome
      onStart={() => finish("/criar-conta")}
      onSignIn={() => finish("/entrar")}
      onExplore={() => finish("/")}
      onHelp={onHelp}
      onTerms={onTerms}
    />
  );
}
