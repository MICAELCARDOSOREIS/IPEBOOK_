import { router } from "expo-router";
import ForgotPassword from "@/view/auth/forgotPassword";

export default function EsqueciSenha() {
  return (
    <ForgotPassword
      onNavigateToSignIn={() => router.replace("/entrar")}
      onBack={() => router.back()}
    />
  );
}
