import { router, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

/** `/termos?aba=privacidade` abre direto na política (link usado na Play Store). */
export default function TermosRoute() {
  const { aba } = useLocalSearchParams<{ aba?: string }>();
  return (
    <TermsAndPrivacy
      initialTab={aba === "privacidade" ? "privacy" : "terms"}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/");
      }}
      onNavigateToDeleteAccount={() => pushOnce("/excluir-conta")}
    />
  );
}
