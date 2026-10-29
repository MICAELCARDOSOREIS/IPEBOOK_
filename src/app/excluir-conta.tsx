import { router } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

export default function ExcluirContaRoute() {
  return (
    <DeleteAccountScreen
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/bem-vindo");
      }}
      onAccountDeleted={() => replaceOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/")}
      onNavigateToLogin={
        WEB_BETA_ONLY
          ? undefined
          : () => pushOnce({ pathname: "/entrar", params: { retorno: "excluir-conta" } })
      }
      onEditProfile={WEB_BETA_ONLY ? undefined : () => pushOnce("/perfil/editar")}
    />
  );
}
