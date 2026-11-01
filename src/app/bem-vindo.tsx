import type { Href } from "expo-router";
import { pushOnce } from "@/view/pushOnce";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

export default function BemVindo() {
  return <WelcomeRoute
      onFinish={(destination) => pushOnce(destination)}
      onHelp={() => pushOnce("/ajuda")}
      onJoinBeta={() => pushOnce("/beta" as Href)}
      onTerms={() => pushOnce("/termos")}
    />;
}
