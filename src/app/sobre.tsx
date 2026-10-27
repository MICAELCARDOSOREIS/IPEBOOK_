import { pushOnce, replaceOnce } from "@/view/pushOnce";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

/** Página que apresenta o IpêBook, sempre acessível (não só no primeiro acesso), com Entrar e Criar conta. */
export default function Sobre() {
  return (
    <WelcomeRoute
      onFinish={(destination) => replaceOnce(destination)}
      onHelp={() => pushOnce("/ajuda")}
      onTerms={() => pushOnce("/termos")}
    />
  );
}
