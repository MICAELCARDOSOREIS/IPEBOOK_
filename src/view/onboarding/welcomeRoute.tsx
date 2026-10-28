import { Linking } from "react-native";
import Welcome from "@/view/onboarding/welcome";
import { PLAY_STORE_URL } from "@/view/playStore";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";
import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";

export type WelcomeDestination = "/criar-conta" | "/entrar";

export type WelcomeRouteProps = {
  onFinish: (destination: WelcomeDestination) => void;
  onHelp?: () => void;
  onTerms?: () => void;
  /** Spec 108: no site, os botões levam ao convite do beta e à Play Store. */
  betaInvite?: boolean;
  onJoinBeta?: () => void;
  onOpenStore?: () => void;
};

/** Liga a tela de boas-vindas à marca de primeiro acesso antes de sair dela (ADR 0022). */
export default function WelcomeRoute({
  onFinish,
  onHelp,
  onTerms,
  betaInvite = WEB_BETA_ONLY,
  onJoinBeta = () => {},
  onOpenStore = () => void Linking.openURL(PLAY_STORE_URL).catch(() => {}),
}: WelcomeRouteProps) {
  const [, dismiss] = useWelcomeGateViewModel();

  const finish = (destination: WelcomeDestination) => {
    void dismiss();
    onFinish(destination);
  };

  if (betaInvite) {
    return <Welcome betaInvite onStart={onJoinBeta} onSignIn={onOpenStore} onHelp={onHelp} onTerms={onTerms} />;
  }

  return (
    <Welcome
      onStart={() => finish("/criar-conta")}
      onSignIn={() => finish("/entrar")}
      onHelp={onHelp}
      onTerms={onTerms}
    />
  );
}
