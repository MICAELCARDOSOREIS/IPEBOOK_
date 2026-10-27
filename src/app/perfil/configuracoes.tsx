import { backOnce, pushOnce } from "@/view/pushOnce";
import { Settings } from "@/view/profile/settings";

export default function ConfiguracoesRoute() {
  return (
    <Settings
      onBack={() => backOnce()}
      onNavigateToTerms={() => pushOnce("/termos")}
      onNavigateToPrivacy={() => pushOnce("/excluir-conta")}
      onNavigateToBlockedUsers={() => pushOnce("/perfil/bloqueados")}
      onNavigateToHelp={() => pushOnce("/ajuda")}
    />
  );
}
