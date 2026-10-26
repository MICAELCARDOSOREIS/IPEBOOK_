import { router } from "expo-router";
import SignUp from "@/view/auth/signUp";

export default function CriarConta() {
  return (
    <SignUp
      onAuthenticated={() => router.replace("/")}
      onNavigateToSignIn={() => router.push("/entrar")}
      onNavigateToTerms={() => router.push("/termos")}
      onBack={() => router.back()}
    />
  );
}
