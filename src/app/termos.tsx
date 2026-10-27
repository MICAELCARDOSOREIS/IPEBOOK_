import { router } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

export default function TermosRoute() {
  return (
    <TermsAndPrivacy
      onBack={() => {
        if (router.canGoBack()) backOnce();
        else replaceOnce("/");
      }}
      onNavigateToDeleteAccount={() => pushOnce("/excluir-conta")}
    />
  );
}
