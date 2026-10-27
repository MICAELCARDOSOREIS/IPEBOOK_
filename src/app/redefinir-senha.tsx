import { useURL } from "expo-linking";
import { router } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import ResetPassword from "@/view/auth/resetPassword";

export default function RedefinirSenhaRoute() {
  const link = useURL();
  return (
    <ResetPassword
      link={link}
      onNavigateToSignIn={() => replaceOnce("/entrar")}
      onNavigateToForgotPassword={() => replaceOnce("/esqueci-senha")}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/");
      }}
    />
  );
}
