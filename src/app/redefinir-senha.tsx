import { useURL } from "expo-linking";
import { router } from "expo-router";
import ResetPassword from "@/view/auth/resetPassword";

export default function RedefinirSenhaRoute() {
  const link = useURL();
  return (
    <ResetPassword
      link={link}
      onNavigateToSignIn={() => router.replace("/entrar")}
      onBack={() => router.back()}
    />
  );
}
