import { router } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import { useURL } from "expo-linking";
import AuthCallback from "@/view/auth/authCallback";

export default function AuthCallbackRoute() {
  const url = useURL();

  return (
    <AuthCallback
      url={url}
      onSuccess={() => replaceOnce("/")}
      onBackToSignIn={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/entrar");
      }}
    />
  );
}
