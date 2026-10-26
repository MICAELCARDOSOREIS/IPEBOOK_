import { router } from "expo-router";
import { useURL } from "expo-linking";
import AuthCallback from "@/view/auth/authCallback";

export default function AuthCallbackRoute() {
  const url = useURL();

  return (
    <AuthCallback
      url={url}
      onSuccess={() => router.replace("/")}
      onBackToSignIn={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/entrar");
      }}
    />
  );
}
