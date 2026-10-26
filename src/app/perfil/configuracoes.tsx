import { router } from "expo-router";
import { Settings } from "@/view/profile/settings";

export default function ConfiguracoesRoute() {
  return (
    <Settings
      onBack={() => router.back()}
      onNavigateToTerms={() => router.push("/termos")}
      onNavigateToPrivacy={() => router.push("/excluir-conta")}
      onNavigateToBlockedUsers={() => router.push("/perfil/bloqueados")}
      onNavigateToHelp={() => router.push("/ajuda")}
    />
  );
}
