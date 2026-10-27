import { router } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import SignUp from "@/view/auth/signUp";

export default function CriarConta() {
  return (
    <SignUp
      onAuthenticated={() => replaceOnce("/")}
      onNavigateToSignIn={() => pushOnce("/entrar")}
      onNavigateToTerms={() => pushOnce("/termos")}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/");
      }}
    />
  );
}
