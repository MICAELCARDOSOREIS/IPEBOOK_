import ModerationScreen from "@/view/moderation/moderation";
import { RequireAuth } from "@/view/components/RequireAuth";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";

/** Fila da moderação (Spec 102); exige sessão e o servidor recusa quem não é moderador. */
export default function ModeracaoRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ModerationScreen
        onBack={() => backOnce()}
        onOpenListing={(id) => pushOnce(`/livro/${id}`)}
        onOpenProfile={(id) => pushOnce(`/perfil/${id}` as never)}
      />
    </RequireAuth>
  );
}
