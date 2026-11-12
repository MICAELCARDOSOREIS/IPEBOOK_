import { pushOnce } from "@/view/pushOnce";
import BetaInviteRoute from "@/view/beta/betaInviteScreen";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

/** Convite público para testar o app Android (Spec 108). Não exige login. */
export default function Beta() {
  return <BetaInviteRoute onNavigateHome={() => pushOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/")} />;
}
