import { router, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import SignIn from "@/view/auth/signIn";

export default function Entrar() {
  const { retorno, termo } = useLocalSearchParams<{ retorno?: string; termo?: string }>();
  return (
    <SignIn
      onAuthenticated={() => {
        if (retorno === "favoritos") replaceOnce("/favoritos");
        else if (retorno === "alertas") replaceOnce({ pathname: "/alertas", params: { termo: termo ?? "" } });
        else replaceOnce("/");
      }}
      onNavigateToSignUp={() => pushOnce("/criar-conta")}
      onNavigateToForgotPassword={() => pushOnce("/esqueci-senha")}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/");
      }}
    />
  );
}
