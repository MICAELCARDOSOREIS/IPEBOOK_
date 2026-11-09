import { router, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

/** `/termos?aba=privacidade` abre direto na política (link usado na Play Store). */
export default function TermosRoute() {
  const { aba } = useLocalSearchParams<{ aba?: string }>();
  return (
    <TermsAndPrivacy
      initialTab={aba === "privacidade" ? "privacy" : "terms"}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/");
      }}
      onNavigateToDeleteAccount={() => pushOnce("/excluir-conta")}
    />
  );
}
