import { router } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import HelpAndFaq from "@/view/help/helpAndFaq";
import { WEB_BETA_ONLY } from "@/view/webBetaMode";

export default function AjudaRoute() {
  return (
    <HelpAndFaq
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce(WEB_BETA_ONLY ? "/bem-vindo" : "/");
      }}
      onOpenConversations={WEB_BETA_ONLY ? undefined : () => pushOnce("/meus-pedidos")}
    />
  );
}
