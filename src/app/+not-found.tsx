import { NotFound } from "@/view/components/NotFound";
import { pushOnce } from "@/view/pushOnce";

/** Rota inexistente (Cloudflare Pages serve `+not-found.html` com status 404). */
export default function NaoEncontrado() {
  return <NotFound onGoHome={() => pushOnce("/")} onExplore={() => pushOnce("/pesquisa")} />;
}
