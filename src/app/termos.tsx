import { router } from "expo-router";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

export default function TermosRoute() {
  return (
    <TermsAndPrivacy
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/");
      }}
      onNavigateToDeleteAccount={() => router.push("/excluir-conta")}
    />
  );
}
