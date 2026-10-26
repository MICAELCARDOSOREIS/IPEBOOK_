import { router } from "expo-router";
import { Settings } from "@/view/profile/settings";

export default function ConfiguracoesRoute() {
  return <Settings onBack={() => router.back()} />;
}
