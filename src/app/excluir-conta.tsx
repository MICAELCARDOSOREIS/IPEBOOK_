import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";

export default function ExcluirContaRoute() {
  return (
    <DeleteAccountScreen
      onBack={() => backOnce()}
      onAccountDeleted={() => replaceOnce("/")}
      onNavigateToLogin={() => pushOnce("/entrar")}
      onEditProfile={() => pushOnce("/perfil/editar")}
    />
  );
}
