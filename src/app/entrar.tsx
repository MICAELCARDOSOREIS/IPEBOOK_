import { router, useLocalSearchParams } from "expo-router";
import SignIn from "@/view/auth/signIn";

export default function Entrar() {
  const { retorno, termo } = useLocalSearchParams<{ retorno?: string; termo?: string }>();
  return (
    <SignIn
      onAuthenticated={() => {
        if (retorno === "favoritos") router.replace("/favoritos");
        else if (retorno === "alertas") router.replace({ pathname: "/alertas", params: { termo: termo ?? "" } });
        else router.replace("/");
      }}
      onNavigateToSignUp={() => router.push("/criar-conta")}
      onNavigateToForgotPassword={() => router.push("/esqueci-senha")}
      onBack={() => router.back()}
    />
  );
}
