import { router, useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";
import { useHydrated } from "@/view/useHydrated";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

/** `/termos?aba=privacidade` abre direto na política (link usado na Play Store). */
export default function TermosRoute() {
  const { aba } = useLocalSearchParams<{ aba?: string }>();
  const hydrated = useHydrated();
  // O HTML estático é gerado sem a query. A Web aplica o destino só após a hidratação.
  const initialTab = aba === "privacidade" && (Platform.OS !== "web" || hydrated) ? "privacy" : "terms";
  return (
    <TermsAndPrivacy
      key={initialTab}
      initialTab={initialTab}
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/");
      }}
      onNavigateToDeleteAccount={() => pushOnce("/excluir-conta")}
    />
  );
}
