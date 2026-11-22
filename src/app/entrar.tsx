import { router, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { getInternalAuthReturnTo, setAuthReturnTo } from "@/view/auth/authReturnTo";
import SignIn from "@/view/auth/signIn";

export default function Entrar() {
  const { returnTo, retorno, termo } = useLocalSearchParams<{ returnTo?: string; retorno?: string; termo?: string }>();
  const destination = getInternalAuthReturnTo(returnTo);
  return (
    <SignIn
      onAuthenticated={() => {
        setAuthReturnTo(undefined);
        if (destination) replaceOnce(destination);
        else if (retorno === "favoritos") replaceOnce("/favoritos");
        else if (retorno === "excluir-conta") replaceOnce("/excluir-conta");
        else if (retorno === "alertas") replaceOnce({ pathname: "/alertas", params: { termo: termo ?? "" } });
        else replaceOnce("/");
      }}
      onGoogleStart={() => setAuthReturnTo(destination)}
      onNavigateToSignUp={() => pushOnce(
        destination ? { pathname: "/criar-conta", params: { returnTo: destination } } : "/criar-conta",
      )}
      onNavigateToForgotPassword={() => pushOnce("/esqueci-senha")}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/bem-vindo");
      }}
    />
  );
}
