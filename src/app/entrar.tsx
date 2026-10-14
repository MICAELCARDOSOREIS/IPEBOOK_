import { router } from "expo-router";
import SignIn from "@/view/auth/signIn";

export default function Entrar() {
  return (
    <SignIn
      onAuthenticated={() => router.replace("/")}
      onNavigateToSignUp={() => router.push("/criar-conta")}
      onNavigateToForgotPassword={() => router.push("/esqueci-senha")}
    />
  );
}
