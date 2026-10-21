import { router } from "expo-router";
import DeleteAccountScreen from "@/view/auth/deleteAccountScreen";

export default function ExcluirContaRoute() {
  return (
    <DeleteAccountScreen
      onBack={() => router.back()}
      onAccountDeleted={() => router.replace("/")}
      onNavigateToLogin={() => router.push("/entrar")}
      onEditProfile={() => router.push("/perfil/editar")}
    />
  );
}
