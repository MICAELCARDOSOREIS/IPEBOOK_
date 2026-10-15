import { router } from "expo-router";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

export default function TermosRoute() {
  return (
    <TermsAndPrivacy
      onBack={() => router.back()}
      onNavigateToDeleteAccount={() => router.push("/excluir-conta")}
    />
  );
}
