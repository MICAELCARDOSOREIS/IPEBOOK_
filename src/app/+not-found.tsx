import { NotFound } from "@/view/components/NotFound";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

/** Rota inexistente (Cloudflare Pages serve `+not-found.html` com status 404). */
export default function NaoEncontrado() {
  return (
    <NotFound
      onGoHome={() => replaceOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/")}
      onExplore={WEB_BETA_ONLY ? undefined : () => pushOnce("/pesquisa")}
    />
  );
}
