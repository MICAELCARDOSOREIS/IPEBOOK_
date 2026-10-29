import { router } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import { useURL } from "expo-linking";
import AuthCallback from "@/view/auth/authCallback";
import { consumeAuthReturnTo } from "@/view/auth/authReturnTo";

export default function AuthCallbackRoute() {
  const url = useURL();

  return (
    <AuthCallback
      url={url}
      onSuccess={() => replaceOnce(consumeAuthReturnTo("/") as never)}
      onBackToSignIn={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/entrar");
      }}
    />
  );
}
