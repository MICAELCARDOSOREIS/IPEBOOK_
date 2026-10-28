import ModerationScreen from "@/view/moderation/moderation";
import { backOnce, pushOnce } from "@/view/pushOnce";

/** Fila da moderação (Spec 102); o servidor recusa quem não é moderador. */
export default function ModeracaoRoute() {
  return (
    <ModerationScreen
      onBack={() => backOnce()}
      onOpenListing={(id) => pushOnce(`/livro/${id}`)}
      onOpenProfile={(id) => pushOnce(`/perfil/${id}` as never)}
    />
  );
}
