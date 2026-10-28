import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { Settings } from "@/view/profile/settings";

export default function ConfiguracoesRoute() {
  return (
    <Settings
      onBack={() => backOnce()}
      onNavigateToTerms={() => pushOnce("/termos")}
      onNavigateToPrivacy={() => pushOnce("/excluir-conta")}
      onNavigateToBlockedUsers={() => pushOnce("/perfil/bloqueados")}
      onNavigateToModeration={() => pushOnce("/moderacao" as never)}
      onNavigateToHelp={() => pushOnce("/ajuda")}
      onNavigateToAbout={() => pushOnce("/sobre" as never)}
      onNavigateToEditProfile={() => pushOnce("/perfil/editar")}
      onNavigateToSecurity={() => pushOnce("/perfil/seguranca")}
      onNavigateToNotifications={() => pushOnce("/notificacoes")}
      onSignedOut={() => replaceOnce("/entrar")}
    />
  );
}
