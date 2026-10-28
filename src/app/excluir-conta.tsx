import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";

export default function ExcluirContaRoute() {
  return (
    <DeleteAccountScreen
      onBack={() => backOnce()}
      onAccountDeleted={() => replaceOnce("/")}
      onNavigateToLogin={() => pushOnce({ pathname: "/entrar", params: { retorno: "excluir-conta" } })}
      onEditProfile={() => pushOnce("/perfil/editar")}
    />
  );
}
