import { router, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { getInternalAuthReturnTo, setAuthReturnTo } from "@/view/auth/authReturnTo";
import SignUp from "@/view/auth/signUp";

export default function CriarConta() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const destination = getInternalAuthReturnTo(returnTo);
  return (
    <SignUp
      onAuthenticated={() => {
        setAuthReturnTo(undefined);
        replaceOnce(destination ?? "/");
      }}
      onGoogleStart={() => setAuthReturnTo(destination)}
      onNavigateToSignIn={() => pushOnce(
        destination ? { pathname: "/entrar", params: { returnTo: destination } } : "/entrar",
      )}
      onNavigateToTerms={() => pushOnce("/termos")}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/bem-vindo");
      }}
    />
  );
}
